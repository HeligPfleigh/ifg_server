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
import { ActionRepository, EvaluationRepository } from '../repositories';
import { ActionRequestBody, ActionsRequestBody } from './specs/action-controller.specs';
import { authenticate, AuthenticationBindings, UserProfile } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { ActionStatus } from '../services/enum';

export class ActionController {
  constructor(
    @repository(ActionRepository)
    public actionRepository: ActionRepository,
    @repository(EvaluationRepository)
    public evaluationRepository: EvaluationRepository,
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
    @requestBody(ActionRequestBody)
    req: { action: string },
  ): Promise<void> {
    const userId = currentUserProfile.id;
    const { action } = req;
    const shouldUpdateAction = await this.actionRepository.findOne({
      where: { userId: { like: userId }, id },
    });
    if (!shouldUpdateAction) {
      throw new HttpErrors.BadRequest('Action isn\'t existed or isn\'t owned by yourself!');
    }
    await this.actionRepository.updateById(id, { action });
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
      where: { userId: { like: userId }, id },
    });
    if (!shouldUpdateAction) {
      throw new HttpErrors.BadRequest('Action isn\'t existed or isn\'t owned by yourself!');
    }
    await this.actionRepository.deleteById(id);
  }

  @post('/actions/archieve', {
    responses: {
      '204': {
        description: 'Actions are archieved',
      },
    },
  })
  @authenticate('jwt')
  async markAsArchieved(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ActionsRequestBody)
    req: { actions: string[] },
  ): Promise<void> {
    const { id } = currentUserProfile;
    const { actions } = req;
    await this.actionRepository.updateAll({ status: ActionStatus.ARCHIEVED }, {
      userId: { like: id },
      or: actions.map(act => ({ id: act }))
    })
  }

  @post('/actions/list', {
    responses: {
      '204': {
        description: 'Actions DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteListActions(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ActionsRequestBody)
    req: { actions: string[] },
  ): Promise<void> {
    const { id } = currentUserProfile;
    const { actions } = req;
    await this.actionRepository.deleteAll({
      userId: { like: id },
      status: ActionStatus.ONGOING,
      or: actions.map(act => ({ id: act }))
    })
  }

  @get('/actions/reasons', {
    responses: {
      '200': {
        description: 'List reasons for action',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['reasons'],
              properties: {
                reasons: { type: 'array' },
              }
            }
          }
        },
      },
    },
  })
  @authenticate('jwt')
  async getListReasons(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.query.string('type') evaluationType?: string,
  ): Promise<{ reasons: string[]; }> {
    const { id } = currentUserProfile;
    const filter = { userId: { like: id }, evaluationType };
    const evaluations = await this.evaluationRepository.find({ where: filter });
    const reasons = [];
    for (const evaluation of evaluations) {
      if (evaluation.influentFactor) {
        reasons.push(evaluation.influentFactor)
      }
    }
    return { reasons };
  }
}
