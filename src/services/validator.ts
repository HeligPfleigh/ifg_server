// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Credentials, IChangePassword } from '../repositories/user.repository';
import * as isemail from 'isemail';
import { HttpErrors } from '@loopback/rest';

interface SignUpCredentials extends Credentials {
  email: string;
}

export function validateCredentials(credentials: SignUpCredentials) {
  // Validate Email
  if (!isemail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }

  // Validate Username
  if (credentials.username.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'username must be minimum 8 characters',
    );
  }

  // Validate Password Length
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password must be minimum 8 characters',
    );
  }
}

export function validateChangePassword(req: IChangePassword) {
  const { newPwd, confirmPwd } = req;

  if (newPwd !== confirmPwd) {
    throw new HttpErrors.BadRequest('The confirmed password is not equal to new password!');
  }
}
