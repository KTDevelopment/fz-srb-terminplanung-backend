import * as admin from "firebase-admin";
import MessagingPayload = admin.messaging.MessagingPayload;

export class FcmMessage {
    receiverIds: string[] = [];
    messagingPayload: MessagingPayload;

    setMessagingPayload(messagingPayload: MessagingPayload) {
        this.messagingPayload = messagingPayload;
        return this;
    }

    setReceiverIds(receiverIds: string[]) {
        this.receiverIds = receiverIds;
        return this;
    }
}
