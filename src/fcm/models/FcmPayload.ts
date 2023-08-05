import {BadRequestException} from "@nestjs/common";
import {AVAILABLE_DEVICE_TYPES, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS} from "../../ressources/devices/device.entity";
import {BaseMessage} from "firebase-admin/lib/messaging/messaging-api";

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

    getBaseMessageByType(deviceType: AVAILABLE_DEVICE_TYPES): BaseMessage {
        switch (deviceType) {
            case DEVICE_TYPE_ANDROID:
                return this.getBaseMessageForAndroid();
            case DEVICE_TYPE_IOS:
                return this.getBaseMessageForIos();
            default:
                return this.getBaseMessageForAndroid()
        }
    }

    getBaseMessageForIos(): BaseMessage {
        this.validate();
        const payload = {
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

    getBaseMessageForAndroid(): BaseMessage {
        this.validate();
        const payload = {
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
