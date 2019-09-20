import { IfgServerApplication } from './application';
import { ExpressServer } from './server';
import { ApplicationConfig } from '@loopback/core';

export { ExpressServer, IfgServerApplication };

export async function main(options: ApplicationConfig = {}) {
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log('Server is running at http://127.0.0.1:3000');
}
