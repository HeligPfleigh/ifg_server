import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'date',
    default: 0,
  })
  DOB?: Date;

  @property({
    type: 'number',
    default: 0,
  })
  height?: number;

  @property({
    type: 'number',
    default: 0,
  })
  weight?: number;

  @property({
    type: 'string',
    default: 'MALE',
  })
  gender?: string;

  @property({
    type: 'string',
  })
  avatar?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isAdmin?: boolean

  @property({
    type: 'string',
  })
  resetPasswordToken?: string

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
