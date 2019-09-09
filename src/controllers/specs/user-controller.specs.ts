import {User} from '../../models';

// Copyright IBM Corp. 2019. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const UserProfileSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {type: 'string'},
    email: {type: 'string'},
    name: {type: 'string'},
  },
};

export const UserTokenSchema = {
  type: 'object',
  properties: {
    token: {type: 'string'},
  },
};

const CredentialsSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

const ChangePasswordSchema = {
  type: 'object',
  required: ['newPwd', 'confirmPwd'],
  properties: {
    newPwd: {
      type: 'string',
      minLength: 8,
    },
    confirmPwd: {
      type: 'string',
      minLength: 8,
    },
  },
};

const ChangeProfileSchema = {
  type: 'object',
  properties: {
    firstName: {type: 'string'},
    lastName: {type: 'string'},
    gender: {type: 'string'},
    height: {type: 'number'},
    weight: {type: 'number'},
    avatar: {type: 'string'},
    DOB: {type: 'string', format: 'date-time'},
  },
};

const ForgotPasswordSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export const ChangePasswordRequestBody = {
  description: 'The input of changing password function',
  required: true,
  content: {
    'application/json': {schema: ChangePasswordSchema},
  },
};

export const ChangeProfileRequestBody = {
  description: 'The input of changing profile function',
  required: true,
  content: {
    'application/json': {schema: ChangeProfileSchema},
  },
};

export const ForgotPasswordRequestBody = {
  description: 'The input of forgot password function',
  required: true,
  content: {
    'application/json': {schema: ForgotPasswordSchema},
  },
};

export namespace UserNamespace {
  export class UserProfile {
    firstName?: string;
    lastName?: string;
    username: string;
    height?: number;
    weight?: number;
    gender?: string;
    DOB?: Date;
    avatar?: string;

    constructor(user: User) {
      this.username = user.username;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.height = user.height;
      this.weight = user.weight;
      this.gender = user.gender;
      this.DOB = user.DOB;
      this.avatar = user.avatar;
    }
  }
}
