import {repository} from '@loopback/repository';
import {
  post,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  HttpErrors,
  Request,
  Response,
  RestBindings,
  param,
} from '@loopback/rest';
import {
  TokenService,
  UserService,
  authenticate,
  AuthenticationBindings,
  UserProfile,
} from '@loopback/authentication';
import {inject} from '@loopback/core';
import _get from 'lodash/get';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {existsSync, unlinkSync} from 'fs';
import {User} from '../models';
import {
  UserRepository,
  Credentials,
  IChangePassword,
  IChangeEmail,
} from '../repositories';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
  MailServiceBindings,
  UploadFileServiceBinding,
} from '../keys';
import {
  validateCredentials,
  validateChangePassword,
  validateEmail,
  validateIsAdminEmail,
} from '../services/validator';
import {
  UserTokenSchema,
  CredentialsRequestBody,
  ChangePasswordRequestBody,
  UserNamespace,
  ChangeProfileRequestBody,
  ForgotPasswordRequestBody,
  ChangeEmailRequestBody,
  ChangeAvatarRequestBody,
  ResetPasswordRequestBody,
} from './specs/user-controller.specs';
import MailerService from '../services/mailer-services';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {UploadFileService} from '../services/uploadfile-service';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(MailServiceBindings.MAIL_SERVICE)
    public mailerService: MailerService,
    @inject(UploadFileServiceBinding.FILE_SERVICE)
    private fileService: UploadFileService,
  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {exclude: ['id']}),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    // ensure a valid email value and password value
    validateCredentials(pick(user, ['email', 'password', 'username']));

    validateIsAdminEmail(user.email);

    // encrypt the password
    // eslint-disable-next-line require-atomic-updates
    user.password = await this.passwordHasher.hashPassword(user.password);

    try {
      // create the new user
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;
      await this.mailerService.sendMail({
        to: savedUser.email,
        subject: 'Welcome to I FEEL GOOD - Bienvenue sur I FEEL GOOD',
        html: `
            <p>Hello ${savedUser.username}</p>
            <p>Congratulations, your account has just been created ! From now on you are free to assess everything in your life and then make changes to live healthier and happier !</p>
            <p>Have fun with the app and we wish you feel so good every day !  ;-)</p>
            <p>Your I Feel Good team</p>
            <br />
            <hr />
            <br />
            <p>Bonjour ${savedUser.username}</p>
            <p>Félicitations, ton compte vient juste d'être crée ! A partir de maintenant tu est libre d'évaluer tout sur ta vie et puis effectuer des changements afin de vivre en meilleure santé et plus heureux-se.</p>
            <p>Amuse-toi bien avec l'appli et on te souhaite de te sentir tellement bien chaque jour !  ;-)</p>
            <p>Ton équipe I Feel Good</p>
          `,
      });
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
              exclude: ['id', 'password'],
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
    const {id} = currentUserProfile;
    const user = await this.userRepository.findById(id);
    return new UserNamespace.UserProfile(user);
  }

  @patch('/users/me/change-email', {
    responses: {
      '200': {
        description: 'Change user email',
      },
    },
  })
  @authenticate('jwt')
  async changeEmail(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ChangeEmailRequestBody) request: IChangeEmail,
  ): Promise<void> {
    const {password, email} = request;
    const {id} = currentUserProfile;
    const currentUser = await this.userRepository.findById(id);
    const currentEmail = currentUser ? currentUser.email : undefined;
    if (!isEqual(currentEmail, email)) {
      // validate email
      validateEmail(request);
      validateIsAdminEmail(currentEmail || '');
      validateIsAdminEmail(email);
      const existedUser = await this.userRepository.findOne({where: {email}});
      if (existedUser) {
        throw new HttpErrors.BadRequest('This email is already registered.');
      }
      const user = await this.userRepository.findById(id);
      // verify current password
      const passwordMatched = await this.passwordHasher.comparePassword(
        password,
        user.password,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized('Current password mismatch.');
      }
      // notice to old email
      await this.mailerService.sendMail({
        to: currentEmail,
        subject: 'New E-mail used - Nouvel E-mail utilisé',
        html: `
          <p>Hello ${user.username},</p>
          <p>From now on this E-mail address is no more your new E-mail used to log into the I Feel Good account.</p>
          <p>See you soon and we wish you to feel so good everyday !  ;-)</p>
          <p>Your I Feel Good app team,</p>
          <br/>
          <hr/>
          <br/>
          <p>Bonjour ${user.username},</p>
          <p>Désormais cette adresse E-mail n'est plus ton E-mail utilisé pour accéder à ton compte I Feel Good.</p>
          <p>A bientôt et on te souhaite de te sentir tellement bien chaque jour !  ;-)</p>
          <p>Ton équipe I Feel Good,</p>
        `,
      });

      // notice action into user via new email
      await this.mailerService.sendMail({
        to: email,
        subject: 'New E-mail used - Nouvel E-mail utilisé',
        html: `
          <p>Hello ${user.username},</p>
          <p>From now on this E-mail address: ${email} is your new E-mail used to log into the I Feel Good account.</p>
          <p>Have fun with the app and we wish you to feel so good everyday !  ;-)</p>
          <p>Your I Feel Good app team,</p>
          <br/>
          <hr/>
          <br/>
          <p>Bonjour ${user.username},</p>
          <p>Désormais cette adresse E-mail est ton E-mail utilisé pour accéder à ton compte I Feel Good.</p>
          <p>Amuse-toi bien avec l'appli et on te souhaite de te sentir tellement bien chaque jour !  ;-)</p>
          <p>Ton équipe I Feel Good,</p>
        `,
      });

      // pass all rules will set new email
      user.email = email;
      // save user info into database
      await this.userRepository.updateById(id, user);
    }
  }

  @patch('/users/me/password', {
    responses: {
      '204': {
        description: 'Change password',
      },
    },
  })
  @authenticate('jwt')
  async changePassword(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ChangePasswordRequestBody) request: IChangePassword,
  ): Promise<void> {
    const {currentPwd, newPwd} = request;
    validateChangePassword(request);
    const {id} = currentUserProfile;
    const user = await this.userRepository.findById(id);
    // verify current password
    const passwordMatched = await this.passwordHasher.comparePassword(
      currentPwd,
      user.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.BadRequest('Current password mismatch.');
    }
    // eslint-disable-next-line require-atomic-updates
    user.password = await this.passwordHasher.hashPassword(newPwd);
    // persitance user info
    await this.userRepository.updateById(id, user);
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'I FEEL GOOD  Password changed - Mot de passe modifié',
      html: `
        <p>Hello ${user.username}</p>
        <p>You have just successfully changed your password.</p>
        <p>Have fun with the app and we wish you feel so good every day !  ;-)</p>
        <p>Your I Feel Good team</p>
        <br/>
        <hr/>
        <br/>
        <p>Bonjour ${user.username}</p>
        <p>Tu viens juste de changer ton mot de passe avec succès.</p>
        <p>Amuse-toi bien avec l'appli et on te souhaite de te sentir tellement bien chaque jour !  ;-)</p>
        <p>Ton équipe I Feel Good</p>
      `,
    });
  }

  @patch('/users/me/change-avatar', {
    responses: {
      '200': {
        description: '[POST] Change user avatar successfully.',
      },
    },
  })
  @authenticate('jwt')
  async changeAvatar(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ChangeAvatarRequestBody) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<void> {
    try {
      // process upload file
      const data = await this.fileService.upload();
      const avatar = _get(data, 'files.[0].path');
      if (!isEmpty(avatar)) {
        // process user info
        const {id} = currentUserProfile;
        const user = await this.userRepository.findById(id);
        try {
          // remove old avatar
          const currentAvatar = _get(user, 'avatar', '');
          if (
            !isEmpty(currentAvatar) &&
            existsSync(`public/${currentAvatar}`)
          ) {
            unlinkSync(`public/${currentAvatar}`);
          }
        } catch (error) {
          // ignore error when remove old avatar
        }
        // update new avatar path
        if (avatar.startsWith('public/')) {
          // remove static directory
          user.avatar = avatar.substring(7);
        } else {
          user.avatar = avatar;
        }
        // save user info into database
        await this.userRepository.updateById(id, user);
      }
    } catch (error) {
      if (error instanceof HttpErrors.UnsupportedMediaType) {
        throw new HttpErrors.UnsupportedMediaType();
      } else {
        throw new HttpErrors.BadRequest(error);
      }
    }
  }

  @patch('/users/me/profile', {
    responses: {
      '200': {
        description: 'Change profile',
        content: {
          'application/json': {
            schema: UserNamespace.UserProfile,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async updateProfile(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(ChangeProfileRequestBody) req: UserNamespace.UserProfile,
  ): Promise<void> {
    const {id} = currentUserProfile;
    const user = await this.userRepository.findById(id);
    const newUser = {...user, ...req};
    await this.userRepository.updateById(id, newUser);
  }

  @patch('/users/me/forgotpwd', {
    responses: {
      '204': {
        description: 'Forgot password',
      },
    },
  })
  async forgotPassword(@requestBody(ForgotPasswordRequestBody)
  request: {
    email: string;
  }): Promise<void> {
    try {
      const {email} = request;

      const randomPwd = (length: number) => {
        let result = '';
        const characters =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
          );
        }
        return result;
      };

      const existedUser = await this.userRepository.findOne({where: {email}});

      if (!existedUser) {
        throw new HttpErrors.BadRequest("This user isn't existed");
      }

      const resetPasswordToken = randomPwd(32);

      await this.userRepository.updateById(existedUser.id, {
        resetPasswordToken,
      });

      await this.mailerService.send({
        template: 'reset-password',
        message: {
          from:
            '"I FEEL GOOD Reset Password - Réinitialisation du mot de passe" <no-reply@ifeelgood.com>',
          to: email,
        },
        locals: {
          username: existedUser.username,
          linking: `https://api.ifeelgood.mttjsc.com/deeplink?url=ifeelgood://auth/resetPwd/${resetPasswordToken}`,
        },
      });
    } catch (error) {
      throw new HttpErrors.BadRequest(error);
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
    try {
      const {id} = currentUserProfile;
      const user = await this.userRepository.findById(id);
      const {email, username} = user;
      validateIsAdminEmail(email);
      await this.userRepository.deleteById(id);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Account deletion - Suppression de compte',
        html: `
            <p>Hello ${username}</p>
            <p>We are sad that you have stopped using I Feel Good app, your account has been successfully deleted.</p>
            <p>Have fun and we wish you to feel so good every day !</p>
            <p>Your I Feel Good team.</p>
            <br/>
            <hr/>
            <br/>
            <p>Bonjour ${username}</p>
            <p>Nous sommes tristes de voir que tu n'utilises plus l'appli I Feel Good, ton compte a été supprimé avec succès.</p>
            <p>Amuse-toi bien et on te souhaite de te sentir tellement bien chaque jour !</p>
            <p>Ton équipe I Feel Good</p>
          `,
      });
    } catch (error) {
      throw new HttpErrors.BadRequest(error);
    }
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Login',
        content: {
          'application/json': {
            schema: UserTokenSchema,
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @patch('/users/resetpwd/{resetPasswordToken}', {
    responses: {
      '200': {
        description: 'Forgot password',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async resetPassword(
    @param.path.string('resetPasswordToken') resetPasswordToken: string,
    @requestBody(ResetPasswordRequestBody)
    req: {password: string; confirmPwd: string},
  ) {
    const {password, confirmPwd} = req;
    if (password !== confirmPwd) {
      throw new HttpErrors.BadRequest("Password isn't matched!");
    }

    const user = await this.userRepository.findOne({
      where: {resetPasswordToken},
    });

    if (!user) {
      throw new HttpErrors.NotFound("User isn't found!");
    }

    user.password = await this.passwordHasher.hashPassword(password);
    user.resetPasswordToken = undefined;

    await this.userRepository.updateById(user.id, user);

    return {email: user.email};
  }
}
