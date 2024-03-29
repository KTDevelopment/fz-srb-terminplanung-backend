import {Test} from "@nestjs/testing";
import {SendFirebaseMessageEventHandler} from "./send-firebase-message.handler";
import {FcmService} from "../fcm.service";
import {MembersService} from "../../ressources/members/members.service";
import {fcmServiceMock} from "../../../test/mocks/fcmServiceMock";
import {membersServiceMock} from "../../../test/mocks/membersServiceMock";
import {plainToInstance} from "class-transformer";
import {SendFirebaseMessageEvent} from "./send-firebase-message.event";
import {
    STATE__ATTEND,
    STATE__DO_NOT_ATTEND,
    STATE__INVITATION_REQUEST_PENDING,
    STATE__INVITED
} from "../../ressources/participations/participation-states/participation-state.entity";
import {getTestEvent, getTestMember, getTestPlanner} from "../../../test/testData";
import {ApplicationLogger} from "../../logger/application-logger.service";
import {loggerMock} from "../../../test/mocks/loggerMock";

describe('SendFirebaseMessageEventHandler Tests', () => {
    let sendFirebaseMessageEventHandler: SendFirebaseMessageEventHandler;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [SendFirebaseMessageEventHandler, {
                provide: FcmService,
                useValue: fcmServiceMock,
            }, {
                provide: MembersService,
                useValue: membersServiceMock,
            }, {
                provide: ApplicationLogger,
                useValue: loggerMock
            }],
        }).compile();

        jest.resetAllMocks();
        membersServiceMock.findPlannerOfMember.mockResolvedValue([getTestPlanner()]);
        sendFirebaseMessageEventHandler = module.get<SendFirebaseMessageEventHandler>(SendFirebaseMessageEventHandler);
    });

    it('should do nothing for privileged callingMember and STATE__ATTEND on "normal" member', () => {
        sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__ATTEND,
            callingMember: getTestPlanner(),
            changedMember: getTestMember(),
            event: getTestEvent(),
        }));
        expectNumberOfCalls(0, 0, 0);
    });

    it('should do nothing for privileged callingMember and STATE__DO_NOT_ATTEND on "normal" member', () => {
        sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__DO_NOT_ATTEND,
            callingMember: getTestPlanner(),
            changedMember: getTestMember(),
            event: getTestEvent(),
        }));
        expectNumberOfCalls(0, 0, 0);
    });

    it('should do Nothing if privileged member changed self invitation message to Member', () => {
        sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__INVITED, //should never happen this way, just to make sure
            callingMember: getTestPlanner(),
            changedMember: getTestPlanner(),
            event: getTestEvent(),
        }));
        expectNumberOfCalls(0, 0, 0);
    });

    it('should send invitation message to Member', () => {
        sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__INVITED,
            callingMember: getTestPlanner(),
            changedMember: getTestMember(),
            event: getTestEvent(),
        }));
        expectNumberOfCalls(1, 0, 0);
    });

    it('should send invitation request message to Planner', async () => {
        fcmServiceMock.notifyPlannerAboutStateChange.mockResolvedValueOnce('foo');
        const result = await sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__INVITATION_REQUEST_PENDING,
            callingMember: getTestMember(),
            changedMember: getTestMember(),
            event: getTestEvent(),
        }));
        expect(result).toBe('foo');
        expectNumberOfCalls(0, 1, 1);
    });

    it('should handle errors of FCMService', async () => {
        fcmServiceMock.notifyPlannerAboutStateChange.mockRejectedValue(new Error('caboom'));
        const result = await sendFirebaseMessageEventHandler.handle(plainToInstance(SendFirebaseMessageEvent, {
            newStateId: STATE__INVITATION_REQUEST_PENDING,
            callingMember: getTestMember(),
            changedMember: getTestMember(),
            event: getTestEvent(),
        }));
        expect(result).toBe(undefined);
        expect(loggerMock.error).toHaveBeenCalled();
        expectNumberOfCalls(0, 1, 1);
    });
});

function expectNumberOfCalls(notifyMemberNumber: number, notifyPlannerNumber: number, findPlannerNumber: number) {
    expect(fcmServiceMock.notifyMemberThatHisStateChanged).toBeCalledTimes(notifyMemberNumber);
    expect(fcmServiceMock.notifyPlannerAboutStateChange).toBeCalledTimes(notifyPlannerNumber);
    expect(membersServiceMock.findPlannerOfMember).toBeCalledTimes(findPlannerNumber);
}
