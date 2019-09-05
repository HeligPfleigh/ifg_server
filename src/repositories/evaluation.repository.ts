import { DefaultCrudRepository } from '@loopback/repository';
import { Evaluation, EvaluationRelations } from '../models';
import { IfgDbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class EvaluationRepository extends DefaultCrudRepository<
  Evaluation,
  typeof Evaluation.prototype.id,
  EvaluationRelations
  > {
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
  ) {
    super(Evaluation, dataSource);
  }
}
