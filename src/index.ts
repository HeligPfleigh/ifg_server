import { IfgServerApplication } from './application';
import { ApplicationConfig } from '@loopback/core';

export { IfgServerApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new IfgServerApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
