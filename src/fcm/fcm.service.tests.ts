import {DeviceSpecificFcmResponse, FcmService} from "./fcm.service";
import {FcmClient} from "./fcm.client";
import {FcmPayloadGenerator} from "./fcm-payload.generator";
import {DevicesService} from "../ressources/devices/devices.service";
import {Test} from "@nestjs/testing";
import {fcmPayloadGeneratorMock} from "../../test/mocks/fcmPayloadGeneratorMock";
import {fcmClientMock} from "../../test/mocks/fcmClientMock";
import {devicesServiceMock} from "../../test/mocks/devicesServiceMock";
import {
    getPlannerListWithDevices,
    getTestEvent,
    getTestMember,
    getTestMemberList,
    getTestMemberListWithDevices,
    getTestMemberWithDevices,
    getTestPlanner,
    testFcmPayload
} from "../../test/testData";
import {ApplicationLogger} from "../logger/application-logger.service";
import {loggerMock} from "../../test/mocks/loggerMock";
import {BatchResponse} from "firebase-admin/lib/messaging/messaging-api";


describe('FcmServiceTests', () => {
    let fcmService: FcmService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [FcmService, {
                provide: FcmClient,
                useValue: fcmClientMock,
            }, {
                provide: FcmPayloadGenerator,
                useValue: fcmPayloadGeneratorMock
            }, {
                provide: DevicesService,
                useValue: devicesServiceMock
            }, {
                provide: ApplicationLogger,
                useValue: loggerMock
            }],
        }).compile();

        fcmService = module.get<FcmService>(FcmService);
        jest.resetAllMocks()
    });

    it('Should Do Nothing for notifyPlannerAboutStateChange when changed member has privileges', async () => {
        const response = await fcmService.notifyPlannerAboutStateChange(getTestEvent(), [getTestPlanner(), getTestPlanner()], getTestPlanner(), 1);
        expect(response).toBeNull();
        expect(fcmPayloadGeneratorMock.generatePayloadForMemberChangedHisState).toBeCalledTimes(0)
    });
    it('should generate Payload and sends messages for notifyPlannerAboutStateChange when planner has devices', async () => {
        const testEvent = getTestEvent();
        const testMember = getTestMember();
        const plannerListWithDevices = getPlannerListWithDevices();
        const newState = 1;
        const testPayload = testFcmPayload(testEvent.eventId);

        fcmPayloadGeneratorMock.generatePayloadForMemberChangedHisState.mockReturnValueOnce(testPayload);
        fcmClientMock.sendToDevice.mockResolvedValue(getAllSuccessFcmTestResponse());

        const response = await fcmService.notifyPlannerAboutStateChange(testEvent, plannerListWithDevices, testMember, newState);

        expect(response).not.toBeNull();
        expectFcmResponse(response, getAllSuccessFcmTestResponse());
        expect(fcmPayloadGeneratorMock.generatePayloadForMemberChangedHisState).toBeCalledTimes(1);
        expect(fcmPayloadGeneratorMock.generatePayloadForMemberChangedHisState).toBeCalledWith(testMember, testEvent, newState);
        expect(fcmClientMock.sendToDevice).toBeCalledTimes(2);
    });
    it('should do nothing for notifyMemberThatHisStateChanged when member has no deivces', async () => {
        const testEvent = getTestEvent();
        const testMember = getTestMember();
        const planner = getTestPlanner();
        const newState = 1;

        const response = await fcmService.notifyMemberThatHisStateChanged(testEvent, testMember, planner, newState);

        expect(response).toBeNull();
        expect(fcmClientMock.sendToDevice).toBeCalledTimes(0);
        expect(fcmPayloadGeneratorMock.generatePayloadForPlanerChangedMemberState).toBeCalledTimes(0);
    });
    it('should generate payloads and send messages for notifyMemberThatHisStateChanged when planner has devices', async () => {
        const testEvent = getTestEvent();
        const testMember = getTestMemberWithDevices();
        const planner = getTestPlanner();
        const newState = 1;
        const testPayload = testFcmPayload(testEvent.eventId);

        fcmPayloadGeneratorMock.generatePayloadForPlanerChangedMemberState.mockReturnValueOnce(testPayload);
        fcmClientMock.sendToDevice.mockResolvedValue(getAllSuccessFcmTestResponse());

        const response = await fcmService.notifyMemberThatHisStateChanged(testEvent, testMember, planner, newState);

        expect(response).not.toBeNull();
        expectFcmResponse(response, getAllSuccessFcmTestResponse());
        expect(fcmClientMock.sendToDevice).toBeCalledTimes(2);
        expect(fcmPayloadGeneratorMock.generatePayloadForPlanerChangedMemberState).toBeCalledTimes(1);
        expect(fcmPayloadGeneratorMock.generatePayloadForPlanerChangedMemberState).toBeCalledWith(planner, testMember, testEvent, newState);
    });
    it('should log warning for self remind', async () => {
        const testEvent = getTestEvent();
        const testMember = getTestPlanner();
        const newState = 1;

        const response = await fcmService.remindParticipator(testEvent, testMember, testMember, newState);
        expect(response).toBeNull();
        expect(loggerMock.warn).toBeCalledTimes(1);
    });
    it('should log warning for remindParticipator when receiver has no devices', async () => {
        const testEvent = getTestEvent();
        const testMember = getTestMember();
        const testPlanner = getTestPlanner();
        const newState = 1;

        const response = await fcmService.remindParticipator(testEvent, testPlanner, testMember, newState);
        expect(response).toBeNull();
        expect(loggerMock.warn).toBeCalledTimes(1);
    });
    it('should log warning for notifyAboutNewNewsletter when no member has any device', async () => {
        const testMemberList = getTestMemberList();

        const response = await fcmService.notifyAllAboutNewNewsletter(testMemberList);
        expect(response).toBeNull();
        expect(loggerMock.warn).toBeCalledTimes(1);
    });
    it('should send correct Messages for notifyAboutNewNewsletter when members have devices', async () => {
        const testMemberList = getTestMemberListWithDevices();
        const testPayload = testFcmPayload();

        fcmPayloadGeneratorMock.generatePayloadForNewNewsletter.mockReturnValueOnce(testPayload);
        fcmClientMock.sendToDevice.mockResolvedValue(getAllSuccessFcmTestResponse(2));

        const response = await fcmService.notifyAllAboutNewNewsletter(testMemberList);

        expect(response).not.toBeNull();
        expectFcmResponse(response, getAllSuccessFcmTestResponse(2));
        expect(fcmClientMock.sendToDevice).toBeCalledTimes(2);
        expect(fcmPayloadGeneratorMock.generatePayloadForNewNewsletter).toBeCalledTimes(1);
    });
});

function expectFcmResponse(response: DeviceSpecificFcmResponse, responseValue: BatchResponse) {
    expect(response.ios).toMatchObject(responseValue);
    expect(response.android).toMatchObject(responseValue);
}

function getAllSuccessFcmTestResponse(numberOfMessages = 1): BatchResponse {
    return {
        failureCount: 0,
        responses: [],
        successCount: numberOfMessages,
    };
}
