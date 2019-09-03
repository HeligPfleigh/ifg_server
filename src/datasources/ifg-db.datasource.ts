import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './ifg-db.datasource.json';

export class IfgDbDataSource extends juggler.DataSource {
  static dataSourceName = 'ifg_db';

  constructor(
    @inject('datasources.config.ifg_db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
