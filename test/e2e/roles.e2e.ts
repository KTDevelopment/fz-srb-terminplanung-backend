import {bodyLengthGreaterOrEqual, bodyMatchesObject, firstBodyItemMatchesObject} from "./_common/expectations";
import {TestResponses} from "./TestData/TestResponses";
import {getAuthenticated} from "./_common/testRequests";
import {adminToken} from "./_common/helper";

describe('Roles', () => {
    describe('/GET roles', () => {
        it('without memberList', async () => {
            return getAuthenticated('/roles', await adminToken())
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 4))
                .expect((res) => firstBodyItemMatchesObject(res, TestResponses.role0()));
        });
        it('with MemberList', async () => {
            return getAuthenticated('/roles', await adminToken())
                .query({join: 'members'})
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 4))
                .expect((res) => firstBodyItemMatchesObject(res, TestResponses.rol0WithMembers()));
        });
    });
    describe('/GET role', () => {
        it('without members', async () => {
            return getAuthenticated('/roles/1', await adminToken())
                .expect(200)
                .expect((res) => bodyMatchesObject(res, TestResponses.roleWithoutMemberList()));
        });
        it('with members', async () => {
            return getAuthenticated('/roles/200', await adminToken())
                .query('join=members')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, TestResponses.roleWithMemberList()));
        });
    });
});
