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
} from '@loopback/rest';
import { Feedback } from '../models';
import { FeedbackRepository, UserRepository } from '../repositories';
import { FeedbackSchema } from './specs/feedback-controller.specs';
import { AuthenticationBindings, UserProfile, authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { MailServiceBindings } from '../keys';
import { MailerService } from '../services/mailer-services';

export class FeedbackController {
  constructor(
    @repository(FeedbackRepository)
    public feedbackRepository: FeedbackRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
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
    feedback: { message: string, subject: string },
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Feedback> {
    const { id } = currentUserProfile;
    const user = await this.userRepository.findById(id);
    const { username, email } = user;
    await this.mailerService.sendMail({
      to: 'ifeelgood.hello@gmail.com',
      subject: `Feedback from ${username} - ${email}`,
      html: `<div><p>${feedback.subject}</p><p>${feedback.message}</p></div>`,
    })
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
    @param.query.object('where', getWhereSchemaFor(Feedback)) where?: Where<Feedback>,
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
    @param.query.object('filter', getFilterSchemaFor(Feedback)) filter?: Filter<Feedback>,
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
