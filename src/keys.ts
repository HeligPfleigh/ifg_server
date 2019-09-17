// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {TokenService, UserService} from '@loopback/authentication';
import {User} from './models';
import {Credentials} from './repositories';
import {MailerService} from './services/mailer-services';
import {PasswordHasher} from './services/hash.password.bcryptjs';
import {NotificationService} from './services/notification-services';
import {UploadFileService} from './services/uploadfile-service';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = '6o8hhl8y6sgf8nej';
  export const TOKEN_EXPIRES_IN_VALUE = '2592000';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}

export namespace MailServiceBindings {
  export const MAIL_SERVICE = BindingKey.create<MailerService>(
    'services.mailer',
  );
}

export namespace NotificationServiceBinding {
  export const NOTIFICATION_SERVICE = BindingKey.create<NotificationService>(
    'service.notification',
  );
}

export namespace UploadFileServiceBinding {
  export const FILE_SERVICE = BindingKey.create<UploadFileService>(
    'uploadfile.utils',
  );
}
