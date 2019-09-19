import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import getValue from 'lodash/get';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';
import {
  AuthenticationBindings,
  UserProfile,
  authenticate,
} from '@loopback/authentication';
import { inject } from '@loopback/core';
import { Feedback } from '../models';
import { PasswordHasherBindings, MailServiceBindings } from '../keys';
import { FeedbackRepository, UserRepository } from '../repositories';
import { FeedbackSchema } from './specs/feedback-controller.specs';
import { MailerService } from '../services/mailer-services';
import { PasswordHasher } from '../services/hash.password.bcryptjs';

export class FeedbackController {
  constructor(
    @repository(FeedbackRepository)
    public feedbackRepository: FeedbackRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(MailServiceBindings.MAIL_SERVICE)
    public mailerService: MailerService,
  ) { }

  @post('/feedbacks', {
    responses: {
      '200': {
        description: 'Feedback model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Feedback) } },
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: FeedbackSchema,
        },
      },
    })
    request: { message: string; subject: string; password?: string },
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Feedback> {
    const { id } = currentUserProfile;
    const user = await this.userRepository.findById(id);
    const { username, email } = user;
    // verify current password
    const password = getValue(request, 'password', '');
    if (!isEmpty(password)) {
      const passwordMatched = await this.passwordHasher.comparePassword(
        password,
        user.password,
      );
      if (!passwordMatched) {
        throw new HttpErrors.BadRequest('Current password mismatch.');
      }
    }
    const feedback = pick(request, ['subject', 'message']);
    await this.mailerService.sendMail({
      to: 'ifeelgood.hello@gmail.com',
      subject: `Feedback from ${username} - ${email}`,
      html: `<div><p>${feedback.subject}</p><p>${feedback.message}</p></div>`,
    });
    await this.mailerService.sendMail({
      to: email,
      subject: `Feedback sent successfully`,
      html: `<p>Your feedback has been sent to the administrator. We will reply as soon as possible.</p>`,
    });
    const newFeedback = { ...feedback, userId: id };
    return this.feedbackRepository.create(newFeedback);
  }

  @get('/feedbacks/count', {
    responses: {
      '200': {
        description: 'Feedback model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Feedback))
    where?: Where<Feedback>,
  ): Promise<Count> {
    return this.feedbackRepository.count(where);
  }

  @get('/feedbacks', {
    responses: {
      '200': {
        description: 'Array of Feedback model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Feedback) },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Feedback))
    filter?: Filter<Feedback>,
  ): Promise<Feedback[]> {
    return this.feedbackRepository.find(filter);
  }

  @get('/feedbacks/{id}', {
    responses: {
      '200': {
        description: 'Feedback model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Feedback) } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Feedback> {
    return this.feedbackRepository.findById(id);
  }
}
