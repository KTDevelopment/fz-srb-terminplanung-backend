import {deleteAuthenticated, getAuthenticated, login, postAuthenticated} from "./_common/testRequests";
import {
    bodyItemMatchesObject,
    bodyLengthEqual,
    bodyLengthGreaterOrEqual,
    bodyMatchesObject,
    firstBodyItemMatchesObject
} from "./_common/expectations";
import {TestResponses} from "./TestData/TestResponses";
import {adminToken, reload} from "./_common/helper";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Participations', () => {
    describe('/GET participators', () => {
        it('it should GET all participators for one event by stateId', async () => {
            return getAuthenticated('/participations', await adminToken())
                .query("filter=eventId||eq||1&filter=stateId||eq||5&join=member")
                .expect(res => {
                    bodyLengthGreaterOrEqual(res, 2);
                    bodyItemMatchesObject(res, 0, {member: TestResponses.jasmin()});
                    bodyItemMatchesObject(res, 1, {member: TestResponses.amely()});
                });
        });
        it('it should GET all participators for one event by sectionId', async () => {
            return getAuthenticated('/participations', await adminToken())
                .query("filter=eventId||eq||1&join=member&filter=member.sectionId||eq||1")
                .expect(res => {
                    bodyLengthGreaterOrEqual(res, 1);
                    firstBodyItemMatchesObject(res, {member: TestResponses.jasmin()});
                });
        });
        it('it should GET participation for one event by memberId', async () => {
            return getAuthenticated('/participations', await adminToken())
                .query("filter=eventId||eq||1&filter=memberId||eq||4&join=member")
                .expect(res => {
                    bodyLengthGreaterOrEqual(res, 1);
                    firstBodyItemMatchesObject(res, {member: TestResponses.amely()});
                });
        });
        it('it should GET participation for one event for planner (only members who are in section of planner)', async () => {
            const loginToken = (await login('martin.walter@web.de', 'password_martin')).body.accessToken;
            return getAuthenticated('/participations', loginToken)
                .query("filter=eventId||eq||1")
                .expect(res => {
                    bodyLengthEqual(res, 1);
                    firstBodyItemMatchesObject(res, {member: TestResponses.jasmin()});
                });
        });
    });

    describe('/POST participations', () => {
        reload();
        it('should post participation for member as admin', async () => {
            await postParticipation({
                eventId: 2,
                memberId: 3,
                stateId: 1
            }, await adminToken());
        });
        it('should post participation for member as planner', async () => {
            const loginToken = (await login('martin.walter@web.de', 'password_martin')).body.accessToken;
            await postParticipation({
                eventId: 2,
                memberId: 2,
                stateId: 1
            }, loginToken);
        });
        it('should post participation self as member', async () => {
            const loginToken = (await login('jasmin.schilke@web.de', 'password_jasmin')).body.accessToken;
            await postParticipation({
                eventId: 2,
                memberId: 2,
                stateId: 4
            }, loginToken);
        });
        it('should post many participations for members as planner', async () => {
            const loginToken = (await login('martin.walter@web.de', 'password_martin')).body.accessToken;

            return postAuthenticated('/participations/bulk', loginToken)
                .send({
                    bulk: [
                        {eventId: 2, memberId: 2, stateId: 1},
                        {eventId: 2, memberId: 6, stateId: 1}
                    ],
                }).expect(res => bodyMatchesObject(res, [
                    {eventId: 2, memberId: 2, stateId: 1},
                    {eventId: 2, memberId: 6, stateId: 1}
                ]));
        });
    });

    describe('/DELETE participations', () => {
        reload();
        it('should delete participation as admin', async () => {
            return deleteAuthenticated('/participations/1', await adminToken())
                .expect(res => bodyMatchesObject(res, {
                    id: 1,
                    memberId: 2,
                    eventId: 1,
                    stateId: 5
                }));
        });
        it('should delete participation if belonging event is deleted', async () => {
            await deleteAuthenticated('/events/2', await adminToken())
                .expect(200);

            return getAuthenticated('/participations/4', await adminToken()).expect(404)
        });
    });
});

async function postParticipation(newParticipation, loginToken?: string) {
    await postAuthenticated('/participations', loginToken)
        .send(newParticipation).expect(res => bodyMatchesObject(res, newParticipation));
}
