import {Injectable} from '@nestjs/common';
import {FcmPayloadGenerator} from "./fcm-payload.generator";
import {FcmClient} from "./fcm.client";
import {Member} from "../ressources/members/member.entity";
import {
    AVAILABLE_DEVICE_TYPES,
    Device,
    DEVICE_TYPE_ANDROID,
    DEVICE_TYPE_IOS
} from "../ressources/devices/device.entity";
import {FcmPayload} from "./models/FcmPayload";
import {Event} from "../ressources/events/event.entity";
import {FcmMessage} from "./models/FcmMessage";
import {DevicesService} from "../ressources/devices/devices.service";
import {ApplicationLogger} from "../logger/application-logger.service";
import {AppException} from "../_common/AppException";
import {BatchResponse} from "firebase-admin/lib/messaging/messaging-api";


@Injectable()
export class FcmService {

    constructor(
        private readonly fcmClient: FcmClient,
        private readonly fcmPayloadGenerator: FcmPayloadGenerator,
        private readonly devicesService: DevicesService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(FcmService.name);
    }

    async notifyPlannerAboutStateChange(event: Event, receivers: Member[], sender: Member, newState): Promise<null | DeviceSpecificFcmResponse> {
        if (sender.isPrivileged()) {
            return null;
        }

        const devices = receivers.reduce((acc: Device[], receiver: Member) => {
            return acc.concat(receiver.devices)
        }, [] as Device[]);

        if (devices.length === 0) {
            this.logger.warn("FCM: no Devices on receivers - " + receivers.map(it => it.memberId).join(','));
            return null;
        }

        const payload = this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(sender, event, newState);

        return this.sendFcmPayload(payload, devices);
    }

    async notifyMemberThatHisStateChanged(event: Event, receiver: Member, sender: Member, newState): Promise<DeviceSpecificFcmResponse> {
        if (!receiver.devices || receiver.devices.length === 0) {
            this.logger.warn("FCM: no Devices on receiver - " + receiver.memberId);
            return null;
        }

        const payload: FcmPayload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(sender, receiver, event, newState);
        return this.sendFcmPayload(payload, receiver.devices);
    }

    async remindParticipator(event: Event, trigger: Member, receiver: Member, currentState): Promise<null | DeviceSpecificFcmResponse> {
        if (trigger.memberId === receiver.memberId) {
            this.logger.warn("no self reminding allowed, member: " + receiver.memberId);
            return null;
        }

        if (receiver.devices.length === 0) {
            this.logger.warn("no devices on receiver: " + receiver.memberId);
            return null;
        }

        const payload: FcmPayload = this.fcmPayloadGenerator.generatePayloadForRemindMember(trigger, event, currentState);

        return this.sendFcmPayload(payload, receiver.devices);
    }

    async notifyAllAboutNewNewsletter(memberList: Member[]): Promise<null | DeviceSpecificFcmResponse> {
        const devices = memberList.reduce((acc: Device[], member: Member) => {
            return acc.concat(member.devices)
        }, [] as Device[]);

        if (devices.length === 0) {
            this.logger.warn("FCM - newsletter Notify - Es sind keine DeviceIds hinterlegt");
            return null;
        }

        const payload = this.fcmPayloadGenerator.generatePayloadForNewNewsletter();

        return this.sendFcmPayload(payload, devices)
    };

    private async sendFcmPayload(payload: FcmPayload, receiverDevices: Device[]): Promise<DeviceSpecificFcmResponse> {
        return {
            ios: await this.sendMessagesByType(payload, receiverDevices, DEVICE_TYPE_IOS),
            android: await this.sendMessagesByType(payload, receiverDevices, DEVICE_TYPE_ANDROID)
        }
    }

    private async sendMessagesByType(payload: FcmPayload, receiverDevices: Device[], deviceType: AVAILABLE_DEVICE_TYPES): Promise<BatchResponse> {
        const registrationIds = this.getRegistrationIdsByType(receiverDevices, deviceType);

        if (registrationIds.length === 0) {
            return NO_MESSAGES_RESPONSE
        }

        return await this.sendMessage(
            (new FcmMessage())
                .setBaseMessage(payload.getBaseMessageByType(deviceType))
                .setReceiverIds(registrationIds)
        )
    }

    private getRegistrationIdsByType(receiverDevices: Device[], deviceType: AVAILABLE_DEVICE_TYPES) {
        return receiverDevices.filter(it => it.deviceType === deviceType).map(it => it.registrationId);
    }

    private async sendMessage(fcmMessage: FcmMessage): Promise<BatchResponse> {
        const response = await this.fcmClient.sendToDevice(fcmMessage);
        this.logger.debug("response from fcm messaging: " + JSON.stringify(response));
        if (response.successCount === fcmMessage.receiverIds.length) {
            return response;
        }

        this.logger.warn('some fcm Messages failed: ' + JSON.stringify(response));

        const removableIds = this.extractRemovableIds(response, fcmMessage.receiverIds);
        if (removableIds.length > 0) {
            await this.removeTheRemovables(removableIds);
        }

        if (response.failureCount === fcmMessage.receiverIds.length) {
            this.logger.error(new Error("Error sending message"), JSON.stringify(response.responses))
        }

        return response;
    }

    private extractRemovableIds(batchResponse: BatchResponse, receiverRegistrationIds: string[]): string[] {
        const removableIds: string[] = []

        receiverRegistrationIds.forEach(receiverRegistrationId => {
            const index = receiverRegistrationIds.indexOf(receiverRegistrationId);
            const currentResult = batchResponse.responses[index];

            if (currentResult.error) {
                switch (currentResult.error.code) {
                    case "messaging/registration-token-not-registered":
                        removableIds.push(receiverRegistrationId);
                        break;
                    case "messaging/invalid-registration-token":
                        removableIds.push(receiverRegistrationId);
                        break;
                }
            }
        });

        return removableIds;
    }

    private async removeTheRemovables(removableIds: string[]) {
        try {
            return await this.devicesService.deleteDevices(removableIds)
        } catch (e) {
            this.logger.error(new AppException(e, "removeTheRemovablesFailed"));
        }
    }
}

const NO_MESSAGES_RESPONSE: BatchResponse = {
    responses: [],
    successCount: 0,
    failureCount: 0,
};

export interface DeviceSpecificFcmResponse {
    ios: BatchResponse,
    android: BatchResponse
}
