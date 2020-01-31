import { juggler } from '@loopback/repository';

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'ifg_db',
  connector: 'mongodb',
  url: "mongodb://localhost:27017/ifg",
  host: "localhost",
  port: 27017,
  user: "",
  password: "",
  database: "ifg",
});
