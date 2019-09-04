import {DefaultCrudRepository} from '@loopback/repository';
import {ActionList, ActionListRelations} from '../models';
import {IfgDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ActionListRepository extends DefaultCrudRepository<
  ActionList,
  typeof ActionList.prototype.id,
  ActionListRelations
> {
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
  ) {
    super(ActionList, dataSource);
  }
}
