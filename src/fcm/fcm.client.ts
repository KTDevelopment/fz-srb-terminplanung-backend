import * as admin from "firebase-admin";
import {retry} from "@lifeomic/attempt";
import {Injectable} from "@nestjs/common";
import {Environment, FireBaseConfig} from "../config/config";
import {ApplicationLogger} from "../logger/application-logger.service";
import {ConfigService} from "../config/config.service";
import cert = admin.credential.cert;
import Messaging = admin.messaging.Messaging;
import MessagingPayload = admin.messaging.MessagingPayload;
import MessagingDevicesResponse = admin.messaging.MessagingDevicesResponse;

@Injectable()
export class FcmClient {

    private messaging: Messaging;
    private config: FireBaseConfig;
    private readonly isTestMode: boolean = false;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(FcmClient.name);
        this.config = configService.config.firebase;
        if (this.config.isEnabled) {
            admin.initializeApp({
                credential: cert(this.config.serviceAccount as any),
                databaseURL: this.config.databaseUrl
            });
            this.messaging = admin.messaging();
            this.logger.log('FcmClient is enabled')
        } else {
            this.logger.log('FcmClient is disabled')
        }
        this.isTestMode = configService.config.env === Environment.TEST
    }

    async sendToDevice(registrationTokens: string[], payload: MessagingPayload): Promise<MessagingDevicesResponse> {
        if (this.isTestMode) {
            return {
                canonicalRegistrationTokenCount: 0,
                failureCount: 0,
                successCount: registrationTokens.length,
                multicastId: 1,
                results: []
            }
        }

        if (!this.config.isEnabled) {
            throw new Error("firebase is not enabled");
        }

        this.logger.debug(`send message ${JSON.stringify(payload)} to ${registrationTokens}`)
        return await retry(async () => {
            return await this.messaging.sendToDevice(registrationTokens, payload) //todo refactor to new API sendMulticast
        }, {
            delay: 200,
            factor: 2,
            maxAttempts: 4,
            handleError(err, context) {
                if (err.code !== 504) {
                    context.abort();
                }
            }
        });
    }
}
