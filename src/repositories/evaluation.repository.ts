import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { Evaluation, EvaluationRelations, User } from '../models';
import { IfgDbDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { UserRepository } from './user.repository';

export class EvaluationRepository extends DefaultCrudRepository<
  Evaluation,
  typeof Evaluation.prototype.id,
  EvaluationRelations
  > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Evaluation, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
  }
}
