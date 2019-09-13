import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  patch,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import { authenticate, AuthenticationBindings, UserProfile } from '@loopback/authentication';
import { inject } from '@loopback/core';
import schedule from 'node-schedule';
import { Notification } from '../models';
import { NotificationRepository, UserRepository, FirebaseRepository } from '../repositories';
import {
  CreateNotificationRequestBody,
  CreateNotificationSchema,
  UpdateNotificationRequestBody,
  UpdateNotificationSchema,
} from './specs/notification-controller.specs';
import { NotificationStatus } from '../services/enum';
import { NotificationServiceBinding } from '../keys';
import { NotificationService } from '../services/notification-services';

export class NotificationController {
  constructor(
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(FirebaseRepository)
    public firebaseRepository: FirebaseRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(NotificationServiceBinding.NOTIFICATION_SERVICE)
    public notificationService: NotificationService,
  ) { }

  @post('/notifications', {
    responses: {
      '200': {
        description: 'Notification model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Notification) } },
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody(CreateNotificationRequestBody)
    notification: CreateNotificationSchema,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Notification> {
    const { id } = currentUserProfile;
    const user = await this.userRepository.findById(id);
    if (!user.isAdmin) {
      throw new HttpErrors.Forbidden('Only admin is allowed for this function!');
    }

    const { status, sendTime, title, language } = notification;
    const firebaseTokens = await this.firebaseRepository.find({ where: { language } });
    const registrationTokens = firebaseTokens.map(token => token.firebaseToken);

    if (registrationTokens.length === 0) {
      throw new HttpErrors.BadRequest('Have no device in this language!');
    }

    if (status === NotificationStatus.SENT) {
      const message = {
        notification: {
          title,
          body: notification.content,
        },
        tokens: registrationTokens,
      }

      await this.notificationService.sendMulticast(message);

      return this.notificationRepository.create({
        title,
        content: notification.content,
        userId: id
      });
    }
    // status is waiting
    if (!sendTime) {
      throw new HttpErrors.UnprocessableEntity('Missing send time!');
    }

    if (new Date(notification.sendTime || 0) < new Date()) {
      throw new HttpErrors.UnprocessableEntity('Send time must be in the future!');
    }

    const newNotification = await this.notificationRepository.create({
      title: notification.title,
      content: notification.content,
      sendTime: new Date(notification.sendTime || 0).toISOString(),
      language: notification.language,
      userId: id,
      status: NotificationStatus.WAITING,
    });

    // set node-schedule here, and send notification in that sendTime
    const date = new Date(newNotification.sendTime || 0);
    schedule.scheduleJob(`${newNotification.id}`, date, async () => {
      const message = {
        notification: {
          title,
          body: notification.content,
        },
        tokens: registrationTokens,
      }

      await this.notificationService.sendMulticast(message);
      await this.notificationRepository.updateById(
        newNotification.id, { status: NotificationStatus.SENT });
    });

    return newNotification;
  }

  @get('/notifications', {
    responses: {
      '200': {
        description: 'Array of Notification model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Notification) },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @param.query.object('filter', getFilterSchemaFor(Notification)) filter?: Filter<Notification>,
  ): Promise<Notification[]> {
    return this.notificationRepository.find(filter);
  }

  @get('/notifications/{id}', {
    responses: {
      '200': {
        description: 'Notification model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Notification) } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Notification> {
    return this.notificationRepository.findById(id);
  }

  @patch('/notifications/{id}', {
    responses: {
      '204': {
        description: 'Notification PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody(UpdateNotificationRequestBody)
    notification: UpdateNotificationSchema,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    const { id: userId } = currentUserProfile;
    const user = await this.userRepository.findById(userId);
    if (!user.isAdmin) {
      throw new HttpErrors.Forbidden('Only admin is allowed for this function!');
    }

    const awaitingNotification = await this.notificationRepository.findOne({
      where: { id, status: NotificationStatus.WAITING }
    });

    if (!awaitingNotification) {
      throw new HttpErrors.BadRequest('Notification isn\'t found!');
    }
    const newData = {
      title: notification.title,
      content: notification.content,
      sendTime: new Date(notification.sendTime || 0).toISOString(),
      language: notification.language,
    }
    // reschedule
    schedule.cancelJob(`${id}`);
    await this.notificationRepository.updateById(id, newData);

    const firebaseTokens = await this.firebaseRepository.find({ where: { language: notification.language } });
    const registrationTokens = firebaseTokens.map(token => token.firebaseToken);
    const date = new Date(notification.sendTime || 0)
    schedule.scheduleJob(id, date, async () => {
      const message = {
        notification: {
          title: notification.title,
          body: notification.content,
        },
        tokens: registrationTokens,
      }

      await this.notificationService.sendMulticast(message);
      await this.notificationRepository.updateById(id, { status: NotificationStatus.SENT });
    })
  }
}
