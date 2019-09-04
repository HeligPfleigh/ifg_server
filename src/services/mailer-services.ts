import { SentMessageInfo } from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');
const nodemailer = require("nodemailer");
import { config } from "../configs";

export class MailerService {
  async sendMail(mailOptions: Mail.Options): Promise<SentMessageInfo> {
    const transporter = nodemailer.createTransport(config.mailAccount);
    return transporter.sendMail(mailOptions);
  }
}
