import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  getModelSchemaRef,
  patch,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import { Firebase } from '../models';
import { FirebaseRepository } from '../repositories';
import { CreateFirebaseTokenRequestBody } from "./specs/firebase-controller.specs";
import { authenticate, AuthenticationBindings, UserProfile } from '@loopback/authentication';
import { inject } from '@loopback/core';

export class FirebaseController {
  constructor(
    @repository(FirebaseRepository)
    public firebaseRepository: FirebaseRepository,
  ) { }

  @post('/firebases', {
    responses: {
      '204': {
        description: 'Add firebase token',
      },
    },
  })
  async create(
    @requestBody(CreateFirebaseTokenRequestBody)
    firebase: { firebaseToken: string; },
  ): Promise<void> {
    const { firebaseToken } = firebase;
    const existedToken = await this.firebaseRepository.findOne({ where: { firebaseToken } });
    if (!existedToken)
      await this.firebaseRepository.create(firebase);
  }

  @patch('/firebases/{firebaseToken}', {
    responses: {
      '204': {
        description: 'Firebase PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('firebaseToken') firebaseToken: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Firebase, { partial: true }),
        },
      },
    })
    firebase: Firebase,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    const existFirebaseToken = await this.firebaseRepository.findOne({ where: { firebaseToken } });
    if (!existFirebaseToken) {
      throw new HttpErrors.BadRequest('Token isn\'t existed');
    }
    const updateData = { ...firebase, userId: currentUserProfile.id }
    await this.firebaseRepository.updateById(existFirebaseToken.id, updateData);
  }
}
