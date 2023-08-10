import {setUpE2E} from "../setup/e2e-setup";
import {getAuthenticated, postAuthenticated} from "../_common/testRequests";
import {adminToken, plannerToken} from "../_common/helper";
import {bodyItemMatchesObject, bodyLengthEqual, bodyLengthGreaterOrEqual} from "../_common/expectations";

setUpE2E()

describe('StatisticsEntries', () => {
    describe("GET", () => {
        it('all statisticEntries as ADMIN', async () => {
            return getAuthenticated('/statisticsEntries', await adminToken())
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 3))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    name: "TestStatisticEntry-1",
                    locationString: "exampleLocation, string",
                    date: "2023-05-12T00:00:00.000Z",
                    eventId: 1,
                    sectionId: 2,
                    isProcessed: false,
                }));
        });

        it('section related statisticEntries as PLANNER', async () => {
            return getAuthenticated('/statisticsEntries', await plannerToken())
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    name: "TestStatisticEntry-2",
                    locationString: "exampleLocation, string",
                    date: "2023-06-12T00:00:00.000Z",
                    eventId: 2,
                    sectionId: 1,
                    isProcessed: true,
                }));
        });

        it('NO statisticEntries as MEMBER', async () => {
            return getAuthenticated('/statisticsEntries').expect(403)
        });
    })

    describe("CREATE", () => {
        it('statisticEntries from Event as ADMIN', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 1,
                    sectionIds: [5, 6],
                })
                .expect(201)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    name: "Oktoberfest Zinndorf",
                    locationString: "Oktoberfest Zinndorf, Festzelt auf dem Anger, 1234 Zinndorf",
                    date: "2018-09-18T03:24:00.000Z",
                    eventId: 1,
                    sectionId: 6,
                    isProcessed: false,
                }));
        });

        it('statisticEntries from Event with custom name as ADMIN', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 3,
                    sectionIds: [4, 5],
                    customName: "customName"
                })
                .expect(201)
                .expect(res => bodyLengthEqual(res, 2))
                .expect(res => bodyItemMatchesObject(res, 1, {
                    name: "customName",
                    locationString: "Zinndorf, Festzelt auf dem Anger, 1234 Zinndorf",
                    date: "2023-07-17T23:24:00.000Z",
                    eventId: 3,
                    sectionId: 5,
                    isProcessed: false,
                }));
        });

        it('NO statisticEntries from Event as PLANNER', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent', await plannerToken())
                .send({
                    eventId: 1,
                    sectionIds: [1, 2, 3],
                    customName: "customName"
                })
                .expect(403);
        });

        it('NO statisticEntries from Event as MEMBER', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent')
                .send({
                    eventId: 1,
                    sectionIds: [1, 2, 3],
                    customName: "customName"
                })
                .expect(403);
        });

        it('NO statisticEntries from Event as ADMIN, if event is not an AUFTRITT', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 12,
                    sectionIds: [1, 2, 3],
                })
                .expect(400)
        });

        it('NO statisticEntries from Event as ADMIN, if event does not exists', async () => {
            return postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 120,
                    sectionIds: [1, 2, 3],
                })
                .expect(400)
        });

        it('NO statisticEntries from Event as ADMIN, if unique constrain of name, eventId and sectionId', async () => {
            await postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 1,
                    sectionIds: [4],
                    customName: "customName",
                })

            return postAuthenticated('/statisticsEntries/fromEvent', await adminToken())
                .send({
                    eventId: 1,
                    sectionIds: [4],
                    customName: "customName",
                })
                .expect(400)
        });
    })
});
