import { DefaultCrudRepository } from '@loopback/repository';
import { Action, ActionRelations } from '../models';
import { IfgDbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class ActionRepository extends DefaultCrudRepository<
  Action,
  typeof Action.prototype.id,
  ActionRelations
  > {
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
  ) {
    super(Action, dataSource);
  }
}
