import {deleteAuthenticated, getAuthenticated, login, postAuthenticated} from "./_common/testRequests";
import {bodyItemMatchesObject, bodyLengthGreaterOrEqual, bodyMatchesObject, firstBodyItemMatchesObject} from "./_common/expectations";
import {TestResponses} from "./TestData/TestResponses";
import {adminToken, reload} from "./_common/helper";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Participations', () => {
    describe('/GET participators', () => {
        it('it should GET all participators for one event by stateId', async () => {
            return getAuthenticated('/participations', await adminToken())
                .query("filter=eventId||eq||1&filter=stateId||eq||7&join=member")
                .expect(res => {
                    bodyLengthGreaterOrEqual(res, 2);
                    bodyItemMatchesObject(res, 0, {member: TestResponses.kevin()});
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
                    bodyLengthGreaterOrEqual(res, 1);
                    firstBodyItemMatchesObject(res, {member: TestResponses.jasmin()});
                    bodyItemMatchesObject(res, 1, {member: TestResponses.alexandra()})
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
        it('should increase performanceCount of member for State HasParticipated', async () => {
            const memberId = 2;
            const loginToken = (await login('martin.walter@web.de', 'password_martin')).body.accessToken;

            const before = (await getAuthenticated('/members/' + memberId, await adminToken())).body;
            await postParticipation({
                eventId: 1,
                memberId,
                stateId: 6
            }, loginToken);

            return getAuthenticated('/members/' + memberId, await adminToken())
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    "performanceCount": before.performanceCount + 1,
                }))
        });
        it('should decrease performanceCount of member for State HasNotParticipated if it was HasParticipated before', async () => {
            const memberId = 6;
            const before = (await getAuthenticated('/members/' + memberId)).body;
            await postParticipation({
                eventId: 1,
                memberId,
                stateId: 7
            }, await adminToken());

            return getAuthenticated('/members/' + memberId)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    "performanceCount": before.performanceCount - 1,
                }))
        });
        it('should leave performanceCount of member as is for State HasNotParticipated if it was not HasParticipated before', async () => {
            const memberId = 2;
            const before = (await getAuthenticated('/members/' + memberId, await adminToken())).body;

            await postParticipation({
                eventId: 1,
                memberId,
                stateId: 7
            }, await adminToken());

            return getAuthenticated('/members/' + memberId, await adminToken())
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    "performanceCount": before.performanceCount,
                }))
        });
        it('should create anniversary if needed', async () => {
            const memberId = 2;

            const before = (await getAuthenticated('/members/' + memberId, await adminToken())).body;

            await postParticipation({
                eventId: 1,
                memberId,
                stateId: 6
            }, await adminToken());

            return getAuthenticated('/anniversaries', await adminToken())
                .query('filter=memberId||eq||' + memberId)
                .expect(res => bodyItemMatchesObject(res, 0,{
                    memberId,
                    "performanceCount": before.performanceCount + 1,
                }))
        });
        it('should delete anniversary if needed', async () => {
            const memberId = 6;

            await postParticipation({
                eventId: 1,
                memberId,
                stateId: 7
            }, await adminToken());

            return getAuthenticated('/anniversaries')
                .query('filter=memberId||eq||' + memberId + '&filter=eventId||eq||1')
                .expect(res => expect(res.body.length).toBe(0))
        });
    });

    describe('/DELETE participations', () => {
        reload();
        it('should delete participation as admin', async () => {
            return deleteAuthenticated('/participations/1', await adminToken())
                .expect(res => bodyMatchesObject(res, {
                    id: 1,
                    memberId: 1,
                    eventId: 1,
                    stateId: 7
                }));
        });
        it('should delete anniversary if belonging participation is deleted as admin (Auftritt)', async () => {
            const memberId = 6;

            const memberBefore = (await getAuthenticated('/members/' + memberId, await adminToken())).body;

            await deleteAuthenticated('/participations/5', await adminToken())
                .expect(res => bodyMatchesObject(res, {
                    id: 5,
                    memberId,
                    eventId: 1,
                    stateId: 6
                }));

            const memberAfter = (await getAuthenticated('/members/' + memberId, await adminToken())).body;

            expect(memberAfter.performanceCount).toBe((memberBefore.performanceCount -1));

            return getAuthenticated('/anniversaries')
                .query('filter=memberId||eq||' + memberId + '&filter=eventId||eq||1')
                .expect(res => expect(res.body.length).toBe(0))
        });
    })
});

async function postParticipation(newParticipation, loginToken?: string) {
    await postAuthenticated('/participations', loginToken)
        .send(newParticipation).expect(res => bodyMatchesObject(res, newParticipation));
}
