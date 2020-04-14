import * as admin from "firebase-admin";
import {BadRequestException} from "@nestjs/common";
import {AVAILABLE_DEVICE_TYPES, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS} from "../../ressources/devices/device.entity";
import MessagingPayload = admin.messaging.MessagingPayload;

export const TYPE_REMIND_MEMBER = "300";
export const TYPE_MEMBER_CHANGED_HIS_STATE = "200";
export const TYPE_PLANNER_CHANGED_MEMBER_STATE = "100";
export const TYPE_NEW_NEWSLETTER = "600";

export class FcmPayload {
    title: string;
    message: string;
    eventId: string;
    type: string;

    setTitle(title: string) {
        this.title = title;
        return this;
    }

    setMessage(message: string) {
        this.message = message;
        return this;
    }

    setEventId(eventId: string) {
        this.eventId = eventId;
        return this;
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    getMessagingPayloadByType(deviceType: AVAILABLE_DEVICE_TYPES): MessagingPayload {
        switch (deviceType) {
            case DEVICE_TYPE_ANDROID:
                return this.getMessagingPayloadForAndroid();
            case DEVICE_TYPE_IOS:
                return this.getMessagingPayloadForIos();
            default:
                return this.getMessagingPayloadForAndroid()
        }
    }

    getMessagingPayloadForIos(): MessagingPayload {
        this.validate();
        let payload = {
            notification: {
                title: this.title,
                body: this.message,
            },
            data: {
                type: this.type
            }
        };

        if (this.eventId) {
            payload.data['eventId'] = this.eventId;
        }

        return payload;
    }

    getMessagingPayloadForAndroid(): MessagingPayload {
        this.validate();
        let payload = {
            notification: {
                title: this.title,
                body: this.message,
            },
            data: {
                type: this.type
            }
        };

        if (this.eventId) {
            payload.data['eventId'] = this.eventId;
        }

        return payload;
    }

    private validate() {
        if (this.title && this.message && this.type) {
            return
        }

        throw new BadRequestException('title, message or type is not set in FcmPayload')
    }
}
