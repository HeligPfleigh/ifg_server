// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Credentials, IChangePassword } from '../repositories/user.repository';
import * as isemail from 'isemail';
import get from 'lodash/get';
import isString from 'lodash/isString';
import { HttpErrors } from '@loopback/rest';
import { Evaluation } from '../models';
import * as Enum from './enum';

interface SignUpCredentials extends Credentials {
  username: string;
}

export function validateEmail(data: string | object) {
  const email = isString(data) ? data : get(data, 'email');
  // Validate Email
  if (!isemail.validate(email)) {
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }
}

export function validateCredentials(credentials: SignUpCredentials) {
  // Validate Email
  if (!isemail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }

  // Validate Username
  if (credentials.username.length < 4) {
    throw new HttpErrors.UnprocessableEntity(
      'username must be minimum 4 characters',
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
    throw new HttpErrors.BadRequest(
      'The confirmed password is not equal to new password!',
    );
  }
}

export function validateSaveEvaluation(req: Omit<Evaluation, 'id'>) {
  const { evaluationType, impactType } = req;
  if (!Object.values(Enum.EvaluationType).includes(evaluationType)) {
    throw new HttpErrors.BadRequest("The evaluation type isn't existed");
  }

  if (impactType && !Object.values(Enum.ImpactType).includes(impactType)) {
    throw new HttpErrors.BadRequest("The impact type isn't existed");
  }
}

export function validateEvaluationType(type: string) {
  if (!Object.values(Enum.EvaluationType).includes(type)) {
    throw new HttpErrors.BadRequest("The evaluation type isn't existed");
  }
}

const listAdminEmail = ['ifeelgood.hello@gmail.com']

export function validateIsAdminEmail(email: string) {
  if (listAdminEmail.find(adminEmail => email.toLowerCase() === adminEmail)) {
    throw new HttpErrors.UnavailableForLegalReasons("You don't have permission to perform this actions");
  }
}
