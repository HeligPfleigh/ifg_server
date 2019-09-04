import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {
  TokenService,
  UserService,
  authenticate,
  AuthenticationBindings,
  UserProfile,
} from '@loopback/authentication';
import { inject } from '@loopback/core';
import pick from 'lodash/pick';
import { User } from '../models';
import { UserRepository, Credentials, IChangePassword, } from '../repositories';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings, MailServiceBindings } from '../keys';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { validateCredentials, validateChangePassword } from '../services/validator';
import {
  UserTokenSchema,
  CredentialsRequestBody,
  ChangePasswordRequestBody,
  UserNamespace,
  ChangeProfileRequestBody,
  ForgotPasswordRequestBody,
} from './specs/user-controller.specs';
import { MailerService } from '../services/mailer-services';


export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: UserService<User, Credentials>,
    @inject(MailServiceBindings.MAIL_SERVICE) public mailerService: MailerService,
  ) { }

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { exclude: ['id'] }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    // ensure a valid email value and password value
    validateCredentials(pick(user, ['email', 'password']));

    // encrypt the password
    // eslint-disable-next-line require-atomic-updates
    user.password = await this.passwordHasher.hashPassword(user.password);

    try {
      // create the new user
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;

      return savedUser;
    } catch (error) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  @get('/users/me', {
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              exclude: ['id', 'password']
            }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<UserNamespace.UserProfile> {
    const { id } = currentUserProfile;
    const user = await this.userRepository.findById(id);
    return new UserNamespace.UserProfile(user);
  }

  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @patch('/users/me/password', {
    responses: {
      '204': {
        'description': 'Change password',
      }
    }
  })
  @authenticate('jwt')
  async changePassword(
    @inject(AuthenticationBindings.CURRENT_USER) currentUserProfile: UserProfile,
    @requestBody(ChangePasswordRequestBody) request: IChangePassword
  ): Promise<void> {
    const { newPwd } = request;
    validateChangePassword(request);
    const { id } = currentUserProfile;

    const user = await this.userRepository.findById(id);
    // eslint-disable-next-line require-atomic-updates
    user.password = await this.passwordHasher.hashPassword(newPwd);
    await this.userRepository.updateById(id, user);
  }

  @patch('/users/me/profile', {
    responses: {
      '200': {
        'description': 'Change profile',
        'content': {
          'application/json': {
            schema: UserNamespace.UserProfile
          }
        }
      }
    }
  })
  @authenticate('jwt')
  async updateProfile(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ChangeProfileRequestBody) req: UserNamespace.UserProfile
  ): Promise<void> {
    const { id } = currentUserProfile;
    const user = this.userRepository.findById(id);
    const newUser = { ...user, ...req };
    await this.userRepository.updateById(id, newUser);
  }

  @patch('/users/me/forgotpwd', {
    responses: {
      '204': {
        'description': 'Forgot password',
      },
    },
  })
  async forgotPassword(
    @requestBody(ForgotPasswordRequestBody) request: { email: string }
  ): Promise<void> {
    try {
      const { email } = request;

      const randomPwd = (length: number) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };

      const [existedUser] = await this.userRepository.find({ where: { email } });
      if (!existedUser) {
        throw new HttpErrors.BadRequest('This user isn\'t existed');
      };

      const newPwd = randomPwd(16);

      existedUser.password = await this.passwordHasher.hashPassword(newPwd);

      await this.userRepository.updateById(existedUser.id, existedUser);

      await this.mailerService.sendMail({
        to: email,
        subject: "Reset password",
        html: `<p>Your request to reset password is processed. This is your new password: ${newPwd}</p>`
      });
    } catch (error) {
      throw new HttpErrors.BadRequest('Some unexpected error occurred!')
    }
  }

  @del('/users/me', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteAccount(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    const { id } = currentUserProfile;
    await this.userRepository.deleteById(id);
  }

  @post('/users/login', {
    responses: {
      '200': {
        'description': 'Login',
        'content': {
          'application/json': {
            schema: UserTokenSchema,
          }
        }
      }
    }
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials
  ): Promise<{ token: string }> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return ({ token });
  }
}
