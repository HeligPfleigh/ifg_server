import {DefaultCrudRepository} from '@loopback/repository';
import {Firebase, FirebaseRelations} from '../models';
import {IfgDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FirebaseRepository extends DefaultCrudRepository<
  Firebase,
  typeof Firebase.prototype.id,
  FirebaseRelations
> {
  constructor(
    @inject('datasources.ifg_db') dataSource: IfgDbDataSource,
  ) {
    super(Firebase, dataSource);
  }
}
