import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import { Action } from '../models';
import { ActionRepository } from '../repositories';
import { ActionRequestBody } from './specs/action-controller.specs';
import { authenticate, AuthenticationBindings, UserProfile } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { ActionStatus } from '../services/enum';

export class ActionController {
  constructor(
    @repository(ActionRepository)
    public actionRepository: ActionRepository,
  ) { }

  @post('/actions', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Action) } },
      },
    },
  })
  @authenticate('jwt')
  async create(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ActionRequestBody)
    action: Omit<Action, 'id'>,
  ): Promise<Action> {
    const { id } = currentUserProfile;
    const newAction = { ...action, userId: id, status: ActionStatus.ONGOING };
    return this.actionRepository.create(newAction);
  }

  @get('/actions/{status}', {
    responses: {
      '200': {
        description: 'Array of Action model instances by status',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Action) },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getActionsByStatus(
    @param.path.string('status') status: string,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Action[]> {
    const { id } = currentUserProfile;
    return this.actionRepository.find({ where: { status, userId: { like: id } } });
  }

  @patch('/actions/{id}', {
    responses: {
      '204': {
        description: 'Action PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Action, { partial: true }),
        },
      },
    })
    action: Action,
  ): Promise<void> {
    const userId = currentUserProfile.id;
    const shouldUpdateAction = await this.actionRepository.findOne({
      where: { userId, id },
    });
    if (!shouldUpdateAction) {
      throw new HttpErrors.BadRequest('Action isn\'t existed or isn\'t owned by yourself!');
    }
    await this.actionRepository.updateById(id, action);
  }

  @del('/actions/{id}', {
    responses: {
      '204': {
        description: 'Action DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(
    @param.path.string('id') id: string,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    const userId = currentUserProfile.id;
    const shouldUpdateAction = await this.actionRepository.findOne({
      where: { userId, id },
    });
    if (!shouldUpdateAction) {
      throw new HttpErrors.BadRequest('Action isn\'t existed or isn\'t owned by yourself!');
    }
    await this.actionRepository.deleteById(id);
  }
}
