import { IfgServerApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
import express, { Request, Response } from 'express';
import pEvent from 'p-event';
import * as path from 'path';

export class ExpressServer {
  private app: express.Application;
  private lbApp: IfgServerApplication;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.app.set('view engine', 'ejs');
    this.lbApp = new IfgServerApplication(options);
    this.app.use('/api', this.lbApp.requestHandler);
    // Custom Express routes
    this.app.get('/resetpassword/:resetPasswordToken', function (_req: Request, res: Response) {
      const resetPasswordToken = _req.params.resetPasswordToken;
      res.render(path.resolve('view/resetpassword'), { resetPasswordToken });
    });
  }

  async boot() {
    await this.lbApp.boot();
  }

  async start() {
    const port = this.lbApp.restServer.config.port || 3000;
    const host = this.lbApp.restServer.config.host || '127.0.0.1';
    const server = this.app.listen(port, host);
    await pEvent(server, 'listening');
  }
}
