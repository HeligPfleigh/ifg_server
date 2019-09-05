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
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Action} from '../models';
import {ActionRepository} from '../repositories';

export class ActionController {
  constructor(
    @repository(ActionRepository)
    public actionRepository : ActionRepository,
  ) {}

  @post('/actions', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: {'application/json': {schema: getModelSchemaRef(Action)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Action, {exclude: ['id']}),
        },
      },
    })
    action: Omit<Action, 'id'>,
  ): Promise<Action> {
    return this.actionRepository.create(action);
  }

  @get('/actions/count', {
    responses: {
      '200': {
        description: 'Action model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Action)) where?: Where<Action>,
  ): Promise<Count> {
    return this.actionRepository.count(where);
  }

  @get('/actions', {
    responses: {
      '200': {
        description: 'Array of Action model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Action)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Action)) filter?: Filter<Action>,
  ): Promise<Action[]> {
    return this.actionRepository.find(filter);
  }

  @patch('/actions', {
    responses: {
      '200': {
        description: 'Action PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Action, {partial: true}),
        },
      },
    })
    action: Action,
    @param.query.object('where', getWhereSchemaFor(Action)) where?: Where<Action>,
  ): Promise<Count> {
    return this.actionRepository.updateAll(action, where);
  }

  @get('/actions/{id}', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: {'application/json': {schema: getModelSchemaRef(Action)}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Action> {
    return this.actionRepository.findById(id);
  }

  @patch('/actions/{id}', {
    responses: {
      '204': {
        description: 'Action PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Action, {partial: true}),
        },
      },
    })
    action: Action,
  ): Promise<void> {
    await this.actionRepository.updateById(id, action);
  }

  @put('/actions/{id}', {
    responses: {
      '204': {
        description: 'Action PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() action: Action,
  ): Promise<void> {
    await this.actionRepository.replaceById(id, action);
  }

  @del('/actions/{id}', {
    responses: {
      '204': {
        description: 'Action DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.actionRepository.deleteById(id);
  }
}
