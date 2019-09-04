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
import {Evaluation} from '../models';
import {EvaluationRepository} from '../repositories';

export class EvaluationController {
  constructor(
    @repository(EvaluationRepository)
    public evaluationRepository : EvaluationRepository,
  ) {}

  @post('/evaluations', {
    responses: {
      '200': {
        description: 'Evaluation model instance',
        content: {'application/json': {schema: getModelSchemaRef(Evaluation)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Evaluation, {exclude: ['id']}),
        },
      },
    })
    evaluation: Omit<Evaluation, 'id'>,
  ): Promise<Evaluation> {
    return this.evaluationRepository.create(evaluation);
  }

  @get('/evaluations/count', {
    responses: {
      '200': {
        description: 'Evaluation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Evaluation)) where?: Where<Evaluation>,
  ): Promise<Count> {
    return this.evaluationRepository.count(where);
  }

  @get('/evaluations', {
    responses: {
      '200': {
        description: 'Array of Evaluation model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Evaluation)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Evaluation)) filter?: Filter<Evaluation>,
  ): Promise<Evaluation[]> {
    return this.evaluationRepository.find(filter);
  }

  @patch('/evaluations', {
    responses: {
      '200': {
        description: 'Evaluation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Evaluation, {partial: true}),
        },
      },
    })
    evaluation: Evaluation,
    @param.query.object('where', getWhereSchemaFor(Evaluation)) where?: Where<Evaluation>,
  ): Promise<Count> {
    return this.evaluationRepository.updateAll(evaluation, where);
  }

  @get('/evaluations/{id}', {
    responses: {
      '200': {
        description: 'Evaluation model instance',
        content: {'application/json': {schema: getModelSchemaRef(Evaluation)}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Evaluation> {
    return this.evaluationRepository.findById(id);
  }

  @patch('/evaluations/{id}', {
    responses: {
      '204': {
        description: 'Evaluation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Evaluation, {partial: true}),
        },
      },
    })
    evaluation: Evaluation,
  ): Promise<void> {
    await this.evaluationRepository.updateById(id, evaluation);
  }

  @put('/evaluations/{id}', {
    responses: {
      '204': {
        description: 'Evaluation PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() evaluation: Evaluation,
  ): Promise<void> {
    await this.evaluationRepository.replaceById(id, evaluation);
  }

  @del('/evaluations/{id}', {
    responses: {
      '204': {
        description: 'Evaluation DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.evaluationRepository.deleteById(id);
  }
}
