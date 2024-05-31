import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { EMailTemplate } from './enums/mail-template.enum';
import { ESubjectName } from './enums/subject-name.enum';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendMail(
    recipient: string,
    subject: ESubjectName,
    template: EMailTemplate,
    context: Record<string, string | number> = {},
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: recipient,
        from: this.configService.get('MAIL_USER'),
        subject,
        template,
        context,
      });
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.BAD_REQUEST
      ) {
        throw error;
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
