import {FcmPayloadGenerator} from "./fcm-payload.generator";
import {FcmPayload} from "./models/FcmPayload";
import {getTestEvent, getTestMember, getTestPlanner} from "../../test/testData";
import {suite, test} from "@testdeck/jest";
import {loggerMock} from "../../test/mocks/loggerMock";

@suite
class FcmPayloadGeneratorTests {

    private fcmPayloadGenerator: FcmPayloadGenerator;
    private payload: FcmPayload;

    before() {
        this.fcmPayloadGenerator = new FcmPayloadGenerator(loggerMock as any);
    }

    @test
    async anyGeneratePayloadFunctionThrowsExceptionForInvalidState() {
        expect(() => this.fcmPayloadGenerator.generatePayloadForRemindMember(getTestPlanner(), getTestEvent(), 25))
            .toThrow("no MessageForRemindMember for state: 25");

        expect(() => this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(getTestPlanner(), getTestEvent(), 25))
            .toThrow("no MessageForPlaner for state: 25");

        expect(() => this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(getTestPlanner(), getTestMember(), getTestEvent(), 25))
            .toThrow("no MessageForMember for state: 25");
    }

    @test
    async generatePayloadForRemindMemberDeliversValidPayloadForState1() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForRemindMember(getTestPlanner(), getTestEvent(), 1);

        let expectedTitle = 'Erinnerung für foo_test_event';
        let expectedMessage = 'plannerFirstName möchte dich daran erinnern, ihm eine Rückmeldung zur Veranstaltung foo_test_event zugeben.';
        let expectedType = '300';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForRemindMemberDeliversValidPayloadForState2() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForRemindMember(getTestPlanner(), getTestEvent(), 2);

        let expectedTitle = 'Erinnerung für foo_test_event';
        let expectedMessage = 'plannerFirstName möchte dich daran erinnern, dass du zur Veranstaltung foo_test_event zugesagt hast.';
        let expectedType = '300';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForMemberChangedHisStateDeliversValidPayloadForState2() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(getTestMember(), getTestEvent(), 2);

        let expectedTitle = 'Neuer Status für memberFirstName memberLastName';
        let expectedMessage = 'memberFirstName memberLastName hat für die Veranstaltung foo_test_event zugesagt.';
        let expectedType = '200';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForMemberChangedHisStateDeliversValidPayloadForState3() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(getTestMember(), getTestEvent(), 3);

        let expectedTitle = 'Neuer Status für memberFirstName memberLastName';
        let expectedMessage = 'memberFirstName memberLastName hat für die Veranstaltung foo_test_event abgesagt.';
        let expectedType = '200';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForMemberChangedHisStateDeliversValidPayloadForState4() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForMemberChangedHisState(getTestMember(), getTestEvent(), 4);

        let expectedTitle = 'Neuer Status für memberFirstName memberLastName';
        let expectedMessage = 'memberFirstName memberLastName möchte an der Veranstaltung foo_test_event teilnehmen.';
        let expectedType = '200';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForPlanerChangedMemberStateDeliversValidPayloadForState1() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(getTestPlanner(), getTestMember(), getTestEvent(), 1);

        let expectedTitle = 'Hey memberFirstName';
        let expectedMessage = 'plannerFirstName hat dich zur Veranstaltung foo_test_event eingeladen.';
        let expectedType = '100';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForPlanerChangedMemberStateDeliversValidPayloadForState0() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(getTestPlanner(), getTestMember(), getTestEvent(), 0);

        let expectedTitle = 'Hey memberFirstName';
        let expectedMessage = 'plannerFirstName hat dich von der Veranstaltung foo_test_event ausgeladen.';
        let expectedType = '100';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForPlanerChangedMemberStateDeliversValidPayloadForState2() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(getTestPlanner(), getTestMember(), getTestEvent(), 2);

        let expectedTitle = 'Hey memberFirstName';
        let expectedMessage = 'plannerFirstName hat bestätigt, dass du an der Veranstaltung foo_test_event teilnehmen kannst.';
        let expectedType = '100';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForPlanerChangedMemberStateDeliversValidPayloadForState5() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForPlanerChangedMemberState(getTestPlanner(), getTestMember(), getTestEvent(), 5);

        let expectedTitle = 'Hey memberFirstName';
        let expectedMessage = 'plannerFirstName hat dich von der Veranstaltung foo_test_event ausgeladen.';
        let expectedType = '100';
        let expectedEventId = '2';

        this.assertPayload(expectedTitle, expectedMessage, expectedType, expectedEventId);
    }

    @test
    async generatePayloadForNotifyAboutNewNewsletter() {
        this.payload = this.fcmPayloadGenerator.generatePayloadForNewNewsletter();

        let expectedTitle = 'Der neue Newsletter ist verfügbar!';
        let expectedMessage = 'Jetzt anzeigen lassen.';
        let expectedType = '600';

        this.assertPayload(expectedTitle, expectedMessage, expectedType);
    }

    private assertPayload(expectedTitle: string, expectedMessage: string, expectedType: string, expectedEventId: string = undefined) {
        expect(this.payload.title).toBe(expectedTitle);
        expect(this.payload.message).toBe(expectedMessage);
        expect(this.payload.type).toBe(expectedType);

        if (this.payload.eventId) {
            expect(this.payload.eventId).toBe(expectedEventId);
        }

        let expectedIosPayload = {
            notification: {
                title: expectedTitle,
                body: expectedMessage,
            },
            data: {
                type: expectedType
            }
        };

        let expectedAndroidPayload = {
            notification: {
                title: expectedTitle,
                body: expectedMessage,
            },
            data: {
                type: expectedType
            }
        };

        if (expectedEventId) {
            expectedAndroidPayload.data['eventId'] = expectedEventId;
            expectedIosPayload.data['eventId'] = expectedEventId;
        }

        expect(this.payload.getMessagingPayloadForIos()).toMatchObject(expectedIosPayload);
        expect(this.payload.getMessagingPayloadForAndroid()).toMatchObject(expectedAndroidPayload);
    }
}


