import {BaseMessage} from "firebase-admin/lib/messaging/messaging-api";

export class FcmMessage {
    receiverIds: string[] = [];
    baseMessage: BaseMessage;

    setBaseMessage(baseMessage: BaseMessage) {
        this.baseMessage = baseMessage;
        return this;
    }

    setReceiverIds(receiverIds: string[]) {
        this.receiverIds = receiverIds;
        return this;
    }
}
