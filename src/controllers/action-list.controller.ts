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
import {ActionList} from '../models';
import {ActionListRepository} from '../repositories';

export class ActionListController {
  constructor(
    @repository(ActionListRepository)
    public actionListRepository : ActionListRepository,
  ) {}

  @post('/action-lists', {
    responses: {
      '200': {
        description: 'ActionList model instance',
        content: {'application/json': {schema: getModelSchemaRef(ActionList)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ActionList, {exclude: ['id']}),
        },
      },
    })
    actionList: Omit<ActionList, 'id'>,
  ): Promise<ActionList> {
    return this.actionListRepository.create(actionList);
  }

  @get('/action-lists/count', {
    responses: {
      '200': {
        description: 'ActionList model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(ActionList)) where?: Where<ActionList>,
  ): Promise<Count> {
    return this.actionListRepository.count(where);
  }

  @get('/action-lists', {
    responses: {
      '200': {
        description: 'Array of ActionList model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ActionList)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ActionList)) filter?: Filter<ActionList>,
  ): Promise<ActionList[]> {
    return this.actionListRepository.find(filter);
  }

  @patch('/action-lists', {
    responses: {
      '200': {
        description: 'ActionList PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ActionList, {partial: true}),
        },
      },
    })
    actionList: ActionList,
    @param.query.object('where', getWhereSchemaFor(ActionList)) where?: Where<ActionList>,
  ): Promise<Count> {
    return this.actionListRepository.updateAll(actionList, where);
  }

  @get('/action-lists/{id}', {
    responses: {
      '200': {
        description: 'ActionList model instance',
        content: {'application/json': {schema: getModelSchemaRef(ActionList)}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<ActionList> {
    return this.actionListRepository.findById(id);
  }

  @patch('/action-lists/{id}', {
    responses: {
      '204': {
        description: 'ActionList PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ActionList, {partial: true}),
        },
      },
    })
    actionList: ActionList,
  ): Promise<void> {
    await this.actionListRepository.updateById(id, actionList);
  }

  @put('/action-lists/{id}', {
    responses: {
      '204': {
        description: 'ActionList PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() actionList: ActionList,
  ): Promise<void> {
    await this.actionListRepository.replaceById(id, actionList);
  }

  @del('/action-lists/{id}', {
    responses: {
      '204': {
        description: 'ActionList DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.actionListRepository.deleteById(id);
  }
}
