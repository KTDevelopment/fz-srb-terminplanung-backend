import {MailService} from "./mail.service";
import {MailClient} from "./mail.client";
import {Test} from "@nestjs/testing";
import {getPasswordResetToken, getPlannerList, getTestEvent, getTestMember} from "../../test/testData";
import {ApplicationLogger} from "../logger/application-logger.service";
import {loggerMock} from "../../test/mocks/loggerMock";
import {ConfigService} from "../config/config.service";

describe('MailServiceTests', () => {
    let mailService: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [MailService, {
                provide: MailClient,
                useValue: mockMailClient,
            }, {
                provide: ConfigService,
                useValue: mockConfigService,
            }, {
                provide: ApplicationLogger,
                useValue: loggerMock
            }],
        }).compile();

        mailService = module.get<MailService>(MailService);
        mockMailClient.sendMail.mockReset();
    });


    it('should mail Planners About State Change', async () => {
        await mailService.mailPlannersAboutStateChange(getTestMember(), getTestEvent(), getPlannerList(), 4);

        // @ts-ignore
        let context = mockMailClient.sendMail.mock.calls[0][0];

        expect(context).toMatchObject({
            from: '"Auftrittsplanung" <terminplanung@fanfarenzug-strausberg-terminplan.de>',
            to: 'plannerMail, planner2Mail',
            subject: 'Das Mitglied memberFirstName memberLastName möchte an der Veranstaltung summary teilnehmen',
            html: "<p>Hallo plannerFirstName plannerLastName und planner2FistName planner2LastName,</p> <b>memberFirstName memberLastName</b> aus deinem Register <b>möchte</b> an der Veranstaltung <b>summary</b> teilnehmen.<br>Bitte bearbeite diese Statusänderung über die offizielle Fanfarenzug Strausberg App oder auf der Webseite der Auftrittsplanung.<br><br>Diese E-mail wurde elektronisch erzeugt, bitte antworte nicht darauf.<br><br>Mit freundlichen Grüßen<br>Die Auftrittsplanung"
        });
    });

    it('should send Password Reset Mail', async () => {
        await mailService.sendPasswordResetMail(getTestMember(), getPasswordResetToken());

        // @ts-ignore
        let context = mockMailClient.sendMail.mock.calls[0][0];

        expect(context).toMatchObject({
            from: '"Auftrittsplanung" <terminplanung@fanfarenzug-strausberg-terminplan.de>',
            to: 'member@email.de',
            subject: 'Beauftragte Passwortrücksetzung',
            html: '<p>Hallo memberFirstName memberLastName,</p> für deinen Account wurde eine Passwortrücksetzung beauftragt.<br>Klick auf den folgenden Link um ein neues Passwort zu vergeben.<br>Solltest du dies nicht beauftragt haben, wende dich bitte an den IT-Beauftraten!<br><br>Passwort zurücksetzen: <a href=\'https://www.passwordResetUrlBase.de/admin#/passwordReset?account=member@email.de&password_reset_token=jwt\'>https://www.passwordResetUrlBase.de/admin#/passwordReset?account=member@email.de&password_reset_token=jwt</a><br><br>Diese E-mail wurde elektronisch erzeugt, bitte antworte nicht darauf.<br><br>Mit freundlichen Grüßen<br>Die Auftrittsplanung'
        });
    })

});

const mockConfigService = {
    config:{
        mail: {
            SMTPConfig: {
                host: "foo_host",
                port: 123,
                auth: {
                    user: "foo_user",
                    pass: "fo_pass"
                },
                tls: {
                    rejectUnauthorized: false
                }
            },
            passwordResetBaseUrl: 'https://www.passwordResetUrlBase.de'
        }
    }
};

const mockMailClient = {
    sendMail: jest.fn().mockResolvedValue('mockSend')
};
