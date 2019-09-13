import {DefaultCrudRepository} from '@loopback/repository';
import {Notification, NotificationRelations} from '../models';
import {IfgDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NotificationRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype.id,
  NotificationRelations
> {
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
  ) {
    super(Notification, dataSource);
  }
}
