import Nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';
import path from 'path';
import get from 'lodash/get';
import EmailTemplate from 'email-templates';
import {config} from '../../configs';

interface EmailOptions {
  /**
   * The template name
   */
  template: string;
  /**
   * Nodemailer Message <Nodemailer.com/message/>
   */
  message: SendMailOptions;
  /**
   * The Template Variables
   */
  // eslint-disable-next-line
  locals: any;
}

export default class MailerService {
  mailer: EmailTemplate;
  transporter: Transporter;

  constructor() {
    this.transporter = Nodemailer.createTransport(config.mailAccount);
    this.mailer = new EmailTemplate({
      send: true,
      preview: false,
      message: undefined,
      i18n: {
        indent: '  ',
        defaultLocale: 'en',
        locales: ['en', 'fr'],
        directory: path.resolve('dist/locales'),
        directoryPermissions: '755',
      },
      views: {
        options: {
          extension: 'ejs',
        },
        root: path.join(__dirname, 'email-templates'),
      },
      transport: this.transporter,
    });
  }

  async send(mailOptions: EmailOptions) {
    console.log(get(mailOptions, 'locales', {}));
    return this.mailer.send({
      template: get(mailOptions, 'template', 'welcome'),
      message: {
        from: 'I FEEL GOOD - SUPPORT <no-reply@ifeelgood.com>', // default mail title
        ...get(mailOptions, 'message', {}), // add custom mail options
      },
      locals: get(mailOptions, 'locals', {}),
    });
  }

  async sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo> {
    return this.transporter.sendMail({
      from: '"👩‍🦰 I FEEL GOOD - SUPPORT" <info@ifeelgood.com>',
      ...mailOptions,
    });
  }
}
