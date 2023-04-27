import {bodyLengthGreaterOrEqual, bodyMatchesObject, firstBodyItemMatchesObject} from "./_common/expectations";
import {TestResponses} from "./TestData/TestResponses";
import {getAuthenticated, login} from "./_common/testRequests";
import {adminToken} from "./_common/helper";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Sections', () => {

    describe('/GET sections', () => {
        it('without memberList', async () => {
            return getAuthenticated('/sections', await adminToken())
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 2))
                .expect((res) => firstBodyItemMatchesObject(res, {
                    "sectionId": 1,
                    "sectionName": "Hochtrommler",
                }));
        });
        it('with MemberList', async () => {
            return getAuthenticated('/sections', await adminToken())
                .query('join=members')
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 2))
                .expect((res) => firstBodyItemMatchesObject(res, {
                    "sectionId": 1,
                    "sectionName": "Hochtrommler",
                    "members": [
                        TestResponses.jasmin(),
                        TestResponses.martin(),
                        TestResponses.alexandra(),
                    ]
                }));
        });
    });
    describe('/GET section', () => {
        it('without memberList', async () => {
            return getAuthenticated('/sections/2', (await login('kevin.thuermann@web.de', 'password_kevin')).body.accessToken)
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "sectionId": 2,
                    "sectionName": "Marschtrommler",
                }));
        });
        it('with MemberList', async () => {
            return getAuthenticated('/sections/2', (await login('kevin.thuermann@web.de', 'password_kevin')).body.accessToken)
                .query('join=members')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "sectionId": 2,
                    "sectionName": "Marschtrommler",
                    "members": [
                        TestResponses.kevin(),
                        TestResponses.amely(),
                    ]
                }));
        });
    });
});
