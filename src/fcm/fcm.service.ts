import {Injectable} from '@nestjs/common';
import * as admin from "firebase-admin";
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
import {DevicesService, RegistrationIdPair} from "../ressources/devices/devices.service";
import {ApplicationLogger} from "../logger/application-logger.service";
import {Maybe} from "purify-ts";
import {AppException} from "../_common/AppException";
import MessagingDevicesResponse = admin.messaging.MessagingDevicesResponse;
import MessagingDeviceResult = admin.messaging.MessagingDeviceResult;


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

    async notifyPlannerAboutStateChange(event: Event, receivers: Member[], sender: Member, newState): Promise<Maybe<DeviceSpecificFcmResponse>> {
        if (sender.isPrivileged()) {
            return Maybe.empty();
        }

        let devices: Device[] = [];
        receivers.forEach((planner: Member) => {
            devices = devices.concat(planner.devices);
        });

        if (devices.length === 0) {
            this.logger.warn("FCM: no Devices on receivers - " + receivers.map(it => it.memberId).join(','));
            return Maybe.empty();
        }

        let payload = this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(sender, event, newState);

        return await this.sendFcmPayload(payload, devices);
    }

    async notifyMemberThatHisStateChanged(event: Event, receiver: Member, sender: Member, newState): Promise<Maybe<DeviceSpecificFcmResponse>> {
        if (!receiver.devices || receiver.devices.length === 0) {
            this.logger.warn("FCM: no Devices on receiver - " + receiver.memberId);
            return Maybe.empty();
        }

        let payload: FcmPayload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(sender, receiver, event, newState);
        return await this.sendFcmPayload(payload, receiver.devices);
    }

    async remindParticipator(event: Event, trigger: Member, receiver: Member, currentState): Promise<Maybe<DeviceSpecificFcmResponse>> {
        if (trigger.memberId === receiver.memberId) {
            this.logger.warn("no self reminding allowed, member: " + receiver.memberId);
            return Maybe.empty();
        }

        if (receiver.devices.length === 0) {
            this.logger.warn("no devices on receiver: " + receiver.memberId);
            return Maybe.empty();
        }

        let payload: FcmPayload = this.fcmPayloadGenerator.generatePayloadForRemindMember(trigger, event, currentState);

        return await this.sendFcmPayload(payload, receiver.devices);
    }

    async notifyAllAboutNewNewsletter(memberList: Member[]): Promise<Maybe<DeviceSpecificFcmResponse>> {
        let devices: Array<Device> = [];
        memberList.forEach((member: Member) => {
            devices = devices.concat(member.devices);
        });

        if (devices.length === 0) {
            this.logger.warn("FCM - newsletter Notify - Es sind keine DeviceIds hinterlegt");
            return Maybe.empty();
        }

        let payload = this.fcmPayloadGenerator.generatePayloadForNewNewsletter();

        return await this.sendFcmPayload(payload, devices)
    };

    private async sendFcmPayload(payload: FcmPayload, receiverDevices: Device[]): Promise<Maybe<DeviceSpecificFcmResponse>> {
        return Maybe.of({
            ios: await this.sendMessagesByType(payload, receiverDevices, DEVICE_TYPE_IOS),
            android: await this.sendMessagesByType(payload, receiverDevices, DEVICE_TYPE_ANDROID)
        })
    }

    private async sendMessagesByType(payload: FcmPayload, receiverDevices: Device[], deviceType: AVAILABLE_DEVICE_TYPES) {
        let registrationIds = this.getRegistrationIdsByType(receiverDevices, deviceType);

        if (registrationIds.length === 0) {
            return NO_MESSAGES_RESPONSE
        }

        return await this.sendMessage((new FcmMessage())
            .setMessagingPayload(payload.getMessagingPayloadByType(deviceType))
            .setReceiverIds(registrationIds))
    }

    private getRegistrationIdsByType(receiverDevices: Device[], deviceType: AVAILABLE_DEVICE_TYPES) {
        return receiverDevices.filter(it => it.deviceType === deviceType).map(it => it.registrationId);
    }

    private async sendMessage(fcmMessage: FcmMessage): Promise<MessagingDevicesResponse> {
        let response = await this.fcmClient.sendToDevice(fcmMessage.receiverIds, fcmMessage.messagingPayload);
        this.logger.debug("response from fcm messaging: " + JSON.stringify(response));
        if (response.successCount === fcmMessage.receiverIds.length && response.canonicalRegistrationTokenCount === 0) {
            return response;
        }

        this.logger.warn('some fcm Messages failed: ' + JSON.stringify(response));

        let separatedResponse = this.separateResponseResults(response.results, fcmMessage.receiverIds);
        if (separatedResponse.removableIds.length > 0) {
            await this.removeTheRemovables(separatedResponse.removableIds);
        }
        if (separatedResponse.replaceableIds.length > 0) {
            await this.replaceTheReplaceables(separatedResponse.replaceableIds);
        }

        if (response.failureCount === fcmMessage.receiverIds.length) {
            this.logger.error(new Error("Error sending message"), JSON.stringify(response.results))
        }

        return response;
    }

    private separateResponseResults(results: MessagingDeviceResult[], receiverRegistrationIds: string[]): SeparatedFcmResults {
        let result: SeparatedFcmResults = {
            removableIds: [],
            replaceableIds: []
        };

        receiverRegistrationIds.forEach(receiverRegistrationId => {
            const index = receiverRegistrationIds.indexOf(receiverRegistrationId);
            const currentResult = results[index];

            if (currentResult.error) {
                switch (currentResult.error.code) {
                    case "messaging/registration-token-not-registered":
                        result.removableIds.push(receiverRegistrationId);
                        break;
                    case "messaging/invalid-registration-token":
                        result.removableIds.push(receiverRegistrationId);
                        break;
                }
            }

            if (currentResult.canonicalRegistrationToken) {
                result.replaceableIds.push({
                    old: receiverRegistrationId,
                    new: currentResult.canonicalRegistrationToken,
                });
            }
        });

        return result;
    }

    private async removeTheRemovables(removableIds: string[]) {
        try {
            return await this.devicesService.deleteDevices(removableIds)
        } catch (e) {
            this.logger.error(new AppException(e, "removeTheRemovablesFailed"));
        }
    }

    private async replaceTheReplaceables(replaceableIdPairs: RegistrationIdPair[]) {
        try {
            return await this.devicesService.updateRegistrationIds(replaceableIdPairs);
        } catch (e) {
            this.logger.error(new AppException(e, "replaceTheReplaceablesFailed"));
        }
    }
}

const NO_MESSAGES_RESPONSE: MessagingDevicesResponse = {
    canonicalRegistrationTokenCount: 0,
    failureCount: 0,
    multicastId: 0,
    results: [],
    successCount: 0,
};

export interface DeviceSpecificFcmResponse {
    ios: MessagingDevicesResponse,
    android: MessagingDevicesResponse
}

interface SeparatedFcmResults {
    removableIds: string[],
    replaceableIds: RegistrationIdPair[]
}
