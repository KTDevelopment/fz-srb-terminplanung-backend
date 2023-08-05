import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {MailClient} from "./mail.client";
import {Member} from "../ressources/members/member.entity";
import {Event} from "../ressources/events/event.entity";
import {
    STATE__DO_NOT_ATTEND,
    STATE__INVITATION_REQUEST_PENDING
} from "../ressources/participations/participation-states/participation-state.entity";
import * as Mail from "nodemailer/lib/mailer";
import {ApplicationLogger} from "../logger/application-logger.service";
import {ConfigService} from "../config/config.service";
import {AppException} from "../_common/AppException";

@Injectable()
export class MailService {

    constructor(
        private readonly configService: ConfigService,
        private readonly mailClient: MailClient,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(MailService.name)
    }

    /**
     * deprecated, gibt kein webinterface worüber man das machen kann will eigentlich auch keins dafür bauen
     * @param member
     * @param event
     * @param plannerList
     * @param stateId
     */
    async mailPlannersAboutStateChange(member: Member, event: Event, plannerList: Member[], stateId: number) {
        try {
            await this.mailClient.sendMail(MailService.generateMailContext(
                MailService.getEmailsAsString(plannerList),
                "Das Mitglied " + member.getFullName() + " " + MailService.parseStateToWording(stateId) + " an der Veranstaltung " + event.summary + " teilnehmen",
                MailService.getHtmlContentForPlaners(member.getFullName(), MailService.getFullNamesAsString(plannerList), event.summary, MailService.parseStateToWording(stateId))
            ));
        } catch (e) {
            this.logger.error(new AppException(e, 'mailPlannersAboutStateChangeFailed'));
        }
    }

    async sendPasswordResetMail(member: Member, passwordResetToken: string) {

        try {
            const passwordResetBaseUrl = this.configService.config.mail.passwordResetBaseUrl;
            const resetUrl = passwordResetBaseUrl + "/admin#/passwordReset" + "?account=" + member.email + "&password_reset_token=" + passwordResetToken;
            await this.mailClient.sendMail(MailService.generateMailContext(
                member.email,
                "Beauftragte Passwortrücksetzung",
                MailService.getHtmlContentForPasswordReset(member.getFullName(), resetUrl)
            ));
        } catch (e) {
            this.logger.error(new AppException(e, 'sendPasswordResetMailFailed'));
            throw new InternalServerErrorException("sending Mail failed");
        }
    }

    private static parseStateToWording(stateId) {
        switch (stateId) {
            case STATE__INVITATION_REQUEST_PENDING:
                return 'möchte';
            case STATE__DO_NOT_ATTEND:
                return 'kann nicht';
            default:
                throw new BadRequestException(' invalid State for parseStateToWording')
        }
    }

    private static getHtmlContentForPasswordReset(anspracheString, resetUrl) {
        return "<p>Hallo " + anspracheString + ",</p> für deinen Account wurde eine Passwortrücksetzung beauftragt.<br>" +
            "Klick auf den folgenden Link um ein neues Passwort zu vergeben.<br>" +
            "Solltest du dies nicht beauftragt haben, wende dich bitte an den IT-Beauftraten!<br><br>" +
            "Passwort zurücksetzen: <a href='" + resetUrl + "'>" + resetUrl + "</a>" +
            MailService.getHTMLGreetings()
    }

    private static getHtmlContentForPlaners(memberNameString, fullNamesAsString, eventSummaryString, keywords) {
        return "<p>Hallo " + fullNamesAsString + ",</p> " + memberNameString.bold() + " aus deinem Register " + keywords.bold() + " an der Veranstaltung " + eventSummaryString.bold() + " teilnehmen.<br>" +
            "Bitte bearbeite diese Statusänderung über die offizielle Fanfarenzug Strausberg App oder auf der Webseite der Auftrittsplanung." +
            MailService.getHTMLGreetings()
    }

    private static getHTMLGreetings() {
        return "<br><br>" +
            "Diese E-mail wurde elektronisch erzeugt, bitte antworte nicht darauf.<br><br>" +
            "Mit freundlichen Grüßen<br>" +
            "Die Auftrittsplanung";
    }

    private static generateMailContext(emailsAsString: string, subjectString: string, htmlContent: string): Mail.Options {
        return {
            from: '"Auftrittsplanung" <terminplanung@fanfarenzug-strausberg-terminplan.de>', // sender address
            to: emailsAsString,
            subject: subjectString, // Subject line
            html: htmlContent
        }
    }

    private static getFullNamesAsString(memberList: Member[]) {
        return memberList.map((member) => {
            return member.getFullName()
        }).join(' und ');
    }

    private static getEmailsAsString(memberList: Member[]) {
        return memberList.map((member) => {
            return member.email
        }).join(', ');
    }
}
