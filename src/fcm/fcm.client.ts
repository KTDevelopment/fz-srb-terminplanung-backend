import * as admin from "firebase-admin";
import {retry} from "@lifeomic/attempt";
import {Injectable} from "@nestjs/common";
import {Environment, FireBaseConfig} from "../config/config";
import {ApplicationLogger} from "../logger/application-logger.service";
import {ConfigService} from "../config/config.service";
import {TokenMessage} from "firebase-admin/lib/messaging";
import {FcmMessage} from "./models/FcmMessage";
import {BatchResponse} from "firebase-admin/lib/messaging/messaging-api";
import cert = admin.credential.cert;
import Messaging = admin.messaging.Messaging;

@Injectable()
export class FcmClient {

    private messaging: Messaging;
    private config: FireBaseConfig;
    private readonly isTestMode: boolean = false;

    constructor(
        configService: ConfigService,
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

    async sendToDevice(fcmMessage: FcmMessage): Promise<BatchResponse> {

        if (this.isTestMode) {
            return {
                responses: fcmMessage.receiverIds.map(receiverId => ({
                    messageId: `TestId-${receiverId}`,
                    success: true,
                })),
                successCount: fcmMessage.receiverIds.length,
                failureCount: 0,
            }
        }

        if (!this.config.isEnabled) {
            throw new Error("firebase is not enabled");
        }

        this.logger.debug(`send message ${JSON.stringify(fcmMessage.baseMessage)} to ${fcmMessage.receiverIds}`)
        return await retry(async () => {
            return await this.messaging.sendEach(this.createTokenMessages(fcmMessage))
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

    private createTokenMessages(fcmMessage: FcmMessage): TokenMessage[] {
        return fcmMessage.receiverIds.map(receiverId => {
            return {
                token: receiverId,
                ...fcmMessage.baseMessage
            }
        })
    }
}
