import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin, SchemaMigrationOptions } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import fs from 'fs';
import { MySequence } from './sequence';
import { JWTAuthenticationStrategy } from './authentication-strategies/jwt-strategy';
import { TokenServiceBindings, TokenServiceConstants, PasswordHasherBindings, UserServiceBindings, MailServiceBindings, NotificationServiceBinding } from './keys';
import { JWTService } from './services/jwt-services';
import { BcryptHasher } from './services/hash.password.bcryptjs';
import { MyUserService } from './services/user-services';
import { MailerService } from './services/mailer-services';
import { UserRepository } from './repositories';
import { NotificationService } from './services/notification-services';

export class IfgServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    this.component(AuthenticationComponent);

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(MailServiceBindings.MAIL_SERVICE).toClass(MailerService);
    this.bind(NotificationServiceBinding.NOTIFICATION_SERVICE)
      .toClass(NotificationService);
  }

  loadAdminInfo() {
    try {
      const fileName = process.env.ADMIN || '';
      const data = fs.readFileSync(fileName, 'utf8').trim();
      return JSON.parse(data);
    } catch (error) {
      return undefined;
    }
  }

  async migrateSchema(options?: SchemaMigrationOptions) {
    await super.migrateSchema(options);

    const adminInfo = this.loadAdminInfo();

    if (!adminInfo) return;

    const userRepo = await this.getRepository(UserRepository);
    const admin = await userRepo.findOne({
      where: {
        email: adminInfo.email,
      }
    });
    if (!admin) {
      const passwordHasher =
        new BcryptHasher(Number(PasswordHasherBindings.ROUNDS));
      const hashPwd = await passwordHasher.hashPassword(adminInfo.password);
      await userRepo.create({
        email: adminInfo.email,
        username: adminInfo.username,
        password: hashPwd,
        isAdmin: true,
      });
    }
  }
}
