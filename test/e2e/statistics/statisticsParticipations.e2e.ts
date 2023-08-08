import {setUpE2E} from "../setup/e2e-setup";
import {deleteAuthenticated, getAuthenticated, postAuthenticated} from "../_common/testRequests";
import {adminToken, plannerToken, reload} from "../_common/helper";
import {
    bodyItemMatchesObject,
    bodyLengthEqual,
    bodyLengthGreaterOrEqual,
    bodyMatchesObject
} from "../_common/expectations";

setUpE2E()

describe('StatisticsParticipation', () => {
    describe("GET", () => {
        it('all statisticsParticipations as ADMIN', async () => {
            return getAuthenticated('/statisticsParticipations', await adminToken())
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 3))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 2,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('section related statisticEntries as PLANNER', async () => {
            return getAuthenticated('/statisticsParticipations', await plannerToken())
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 3,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('own statisticEntry as MEMBER', async () => {
            return getAuthenticated('/statisticsParticipations').expect(200)
                .expect(res => bodyLengthEqual(res, 1))
                .expect(res => bodyItemMatchesObject(res, 0, {
                    memberId: 6,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });
    })

    describe("CREATE", () => {
        reload()
        it('one statisticsParticipation as ADMIN', async () => {
            return postAuthenticated('/statisticsParticipations', await adminToken())
                .send({
                    memberId: 2,
                    statisticsEntryId: 2,
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    memberId: 2,
                    statisticsEntryId: 2,
                    performanceCount: 100,
                }));
        });

        it('many statisticsParticipation as ADMIN', async () => {
            return postAuthenticated('/statisticsParticipations/bulk', await adminToken())
                .send({
                    bulk: [
                        {
                            memberId: 5,
                            statisticsEntryId: 1,
                        },
                        {
                            memberId: 5,
                            statisticsEntryId: 2,
                        }
                    ]
                })
                .expect(201)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 5,
                    statisticsEntryId: 2,
                    performanceCount: 60002,
                }));
        });

        it('one statisticsParticipation as PLANNER', async () => {
            return postAuthenticated('/statisticsParticipations', await plannerToken())
                .send({
                    memberId: 2,
                    statisticsEntryId: 2,
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    memberId: 2,
                    statisticsEntryId: 2,
                    performanceCount: 100,
                }));
        });

        it('many statisticsParticipation as PLANNER', async () => {
            return postAuthenticated('/statisticsParticipations/bulk', await plannerToken())
                .send({
                    bulk: [
                        {
                            memberId: 5,
                            statisticsEntryId: 1,
                        },
                        {
                            memberId: 5,
                            statisticsEntryId: 2,
                        }
                    ]
                })
                .expect(201)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 5,
                    statisticsEntryId: 2,
                    performanceCount: 60002,
                }));
        });

        it('one and increase performanceCount of member', async () => {
            const authToken = await adminToken();
            const memberId = 2;

            const before = (await getAuthenticated('/members/' + memberId, authToken)).body;
            await postAuthenticated('/statisticsParticipations', authToken)
                .send({
                    memberId,
                    statisticsEntryId: 2,
                })

            return getAuthenticated('/members/' + memberId, authToken)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    "performanceCount": before.performanceCount + 1,
                }))
        });

        it('one and create anniversary if needed', async () => {
            const authToken = await adminToken();
            const memberId = 2;

            const before = (await getAuthenticated('/members/' + memberId, authToken)).body;

            await postAuthenticated('/statisticsParticipations', authToken)
                .send({
                    memberId,
                    statisticsEntryId: 2,
                })

            return getAuthenticated('/anniversaries', authToken)
                .query('filter=memberId||eq||' + memberId)
                .expect(res => bodyItemMatchesObject(res, 0, {
                    memberId,
                    "performanceCount": before.performanceCount + 1,
                }))
        });

        it('NO statisticsParticipation as MEMBER', async () => {
            return postAuthenticated('/statisticsParticipations')
                .send({
                    memberId: 2,
                    statisticsEntryId: 2,
                })
                .expect(403)
        });

        it('NO statisticsParticipation when statisticsEntry does NOT exists', async () => {
            return postAuthenticated('/statisticsParticipations', await adminToken())
                .send({
                    memberId: 2,
                    statisticsEntryId: 200,
                })
                .expect(400)
        });

        it('NO statisticsParticipation when statisticsEntry is NOT in Past', async () => {
            return postAuthenticated('/statisticsParticipations', await adminToken())
                .send({
                    memberId: 2,
                    statisticsEntryId: 4,
                })
                .expect(400)
        });

        it('NO statisticsParticipation when member does NOT exists', async () => {
            return postAuthenticated('/statisticsParticipations', await adminToken())
                .send({
                    memberId: 20000,
                    statisticsEntryId: 2,
                })
                .expect(400)
        });

        it('can handle already existing statisticsParticipation', async () => {
            return postAuthenticated('/statisticsParticipations', await adminToken())
                .send({
                    memberId: 1,
                    statisticsEntryId: 1,
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    memberId: 1,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });
    })

    describe("DELETE", () => {
        reload()
        it('one statisticsParticipation as ADMIN', async () => {
            return deleteAuthenticated('/statisticsParticipations/1', await adminToken())
                .expect(200)
                .expect(res => bodyMatchesObject(res, {
                    memberId: 1,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('many statisticsParticipation as ADMIN', async () => {
            return deleteAuthenticated('/statisticsParticipations/bulk', await adminToken())
                .send({bulk: [2, 3]})
                .expect(200)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 6,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('one statisticsParticipation as PLANNER', async () => {
            return deleteAuthenticated('/statisticsParticipations/2', await plannerToken())
                .expect(200)
                .expect(res => bodyMatchesObject(res, {
                    memberId: 2,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('NO statisticsParticipation as PLANNER if wrong section is addressed for single', async () => {
            return deleteAuthenticated('/statisticsParticipations/1', await plannerToken()).expect(400)
        });

        it('many statisticsParticipation as PLANNER', async () => {
            return deleteAuthenticated('/statisticsParticipations/bulk', await plannerToken())
                .send({
                    bulk: [2, 3]
                })
                .expect(200)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 6,
                    statisticsEntryId: 1,
                    performanceCount: 100,
                }));
        });

        it('NO statisticsParticipation as PLANNER if wrong section is addressed for many requests', async () => {
            await deleteAuthenticated('/statisticsParticipations/bulk', await plannerToken())
                .send({
                    bulk: [1, 3]
                })
                .expect(400)

            return getAuthenticated("/statisticsParticipations", await adminToken())
                .query('filter=id||in||1,3')
                .expect(200)
                .expect(res => bodyLengthEqual(res, 2))
        });

        it('NO statisticsParticipation as PLANNER if it does NOT exist', async () => {
            return deleteAuthenticated('/statisticsParticipations/100', await plannerToken()).expect(400)
        });

        it('NO statisticsParticipation as PLANNER if many doe NOT exist', async () => {
            return deleteAuthenticated('/statisticsParticipations/bulk', await plannerToken())
                .send({
                    bulk: [100, 300]
                })
                .expect(400)
        });

        it('one and deletes anniversary if needed', async () => {
            const token = await adminToken()
            const memberId = 2;

            await getAuthenticated('/anniversaries', token)
                .query('filter=memberId||eq||' + memberId + '&filter=statisticsEntryId||eq||1')
                .expect(res => expect(res.body.length).toBe(1))

            await deleteAuthenticated('/statisticsParticipations/2', token)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    statisticsEntryId: 1,
                    performanceCount: 100
                }));

            return getAuthenticated('/anniversaries', token)
                .query('filter=memberId||eq||' + memberId + '&filter=statisticsEntryId||eq||1')
                .expect(res => expect(res.body.length).toBe(0))
        });

        it('one and decreases performanceCount of related member', async () => {
            const token = await adminToken()
            const memberId = 2;

            const memberBefore = (await getAuthenticated('/members/' + memberId, token)).body;

            await deleteAuthenticated('/statisticsParticipations/2', token)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    statisticsEntryId: 1,
                    performanceCount: 100
                }));

            const memberAfter = (await getAuthenticated('/members/' + memberId, token)).body;

            expect(memberAfter.performanceCount).toBe((memberBefore.performanceCount - 1));
        });

        it('one and write deletion protocol', async () => {
            const token = await adminToken()
            const memberId = 2;

            await global.testDataManager.cleanStatisticsDeletionProtocols()

            await deleteAuthenticated('/statisticsParticipations/2', token)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    statisticsEntryId: 1,
                    performanceCount: 100
                }));

            return getAuthenticated('/statisticsDeletionProtocols', token)
                .query('filter=memberId||eq||' + memberId + '&filter=statisticsEntryId||eq||1')
                .expect(res => expect(res.body.length).toBe(1))
        });

        it('one and updates newer statisticsParticipations and anniversaries', async () => {
            const token = await adminToken()
            const memberId = 3;

            await deleteAuthenticated('/statisticsParticipations/4', token)
                .expect(res => bodyMatchesObject(res, {
                    memberId,
                    statisticsEntryId: 1,
                    performanceCount: 100
                }));

            await getAuthenticated('/anniversaries', token)
                .query('filter=memberId||eq||' + memberId)
                .expect(res => bodyLengthEqual(res, 1))
                .expect(res => bodyItemMatchesObject(res, 0, {
                    memberId: 3,
                    statisticsEntryId: 3,
                    performanceCount: 100
                }))

            return getAuthenticated('/statisticsParticipations', token)
                .query('filter=memberId||eq||' + memberId)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 0, {
                    memberId: 3,
                    statisticsEntryId: 3,
                    performanceCount: 100,
                }))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    memberId: 3,
                    statisticsEntryId: 4,
                    performanceCount: 199,
                }))
        });
    })
});
