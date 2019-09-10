import {DefaultCrudRepository} from '@loopback/repository';
import {User, UserRelations} from '../models';
import {IfgDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export type Credentials = {
  username: string;
  password: string;
};

export type IChangePassword = {
  currentPwd: string;
  newPwd: string;
  confirmPwd: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(@inject('datasources.ifg_db') dataSource: IfgDbDataSource) {
    super(User, dataSource);
  }
}
