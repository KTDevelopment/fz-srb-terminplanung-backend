import {createTransport, SentMessageInfo} from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "../config/config.service";

@Injectable()
export class MailClient {

    private transporter: Mail;

    constructor(private readonly configService: ConfigService) {
        const mailConfig = this.configService.config.mail;
        this.transporter = createTransport(mailConfig.SMTPConfig);
    }

    async sendMail(mailContext: Mail.Options): Promise<SentMessageInfo> {
        return await this.transporter.sendMail(mailContext);
    }
}
