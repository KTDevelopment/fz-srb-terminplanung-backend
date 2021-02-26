import {deleteAuthenticated, getAuthenticated, patchAuthenticated, postAuthenticated, putAuthenticated} from "./_common/testRequests";
import {bodyItemMatchesObject, bodyLengthGreaterOrEqual, bodyMatchesObject, firstBodyItemMatchesObject} from "./_common/expectations";
import {TestResponses} from "./TestData/TestResponses";
import {adminToken, reload} from "./_common/helper";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Member', () => {
    describe('/GET Member', () => {
        it('should getBaseMember', async () => {
            return getAuthenticated('/members/1', await adminToken())
                .expect(res => bodyMatchesObject(res, TestResponses.kevin()));
        });

        it('should getMemberWithSection', async () => {
            return getAuthenticated('/members/1', await adminToken())
                .query('join=section')
                .expect(res => bodyMatchesObject(res, TestResponses.kevinWithSection()));
        });

        it('should getMemberWithRoles', async () => {
            return getAuthenticated('/members/1', await adminToken())
                .query('join=roles')
                .expect(res => bodyMatchesObject(res, TestResponses.kevinWithRoles()));
        });

        it('should getMemberWithDevices', async () => {
            return getAuthenticated('/members/1', await adminToken())
                .query('join=devices')
                .expect(res => bodyMatchesObject(res, TestResponses.kevinWithDevices()));
        });

        it('should get MemberData for other Member then self, if not admin', async () => {
            return getAuthenticated('/members/1')
                .expect(404)
                .expect(res => bodyMatchesObject(res, {"statusCode": 404, "error": "Not Found", "message": "Member not found"}))
        });

        it('should get MemberData for self, if role is Member', async () => {
            return getAuthenticated('/members/6')
                .expect(res => bodyMatchesObject(res, TestResponses.alexandra()));
        });
    });

    describe('/GET Members', () => {
        it('should getBaseMembers', async () => {
            return getAuthenticated('/members', await adminToken())
                .expect(res => bodyLengthGreaterOrEqual(res, 5))
                .expect(res => firstBodyItemMatchesObject(res, TestResponses.kevin()));
        });

        it('should getMembersIncludingDeleted', async () => {
            return getAuthenticated('/members', await adminToken())
                .query('includeDeleted=true')
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 6))
                .expect(res => bodyItemMatchesObject(res, 4, TestResponses.paul()));
        });

        it('should getBaseMembers By Email', async () => {
            return getAuthenticated('/members', await adminToken())
                .query('filter=email||eq||kevin.thuermann@web.de')
                .expect(res => bodyLengthGreaterOrEqual(res, 1))
                .expect(res => firstBodyItemMatchesObject(res, TestResponses.kevin()));
        });

        it('should get member ready for participation statistics', async () => {
            return getAuthenticated('/members', await adminToken())
                .query('?sort=performanceCount,ASC&sort=firstName,ASC')
                .expect(res => bodyLengthGreaterOrEqual(res, 1))
                .expect(res => firstBodyItemMatchesObject(res, TestResponses.alexandra()));
        });
    });

    describe('/POST member', () => {
        reload();
        it('without roles', async () => {
            return postAuthenticated('/members', await adminToken())
                .send(MEMBER_DATA.POST_WithoutRoles)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.POST_RECEIVE_WithoutRoles));
        });

        it('with roles', async () => {
            return postAuthenticated('/members', await adminToken())
                .send(MEMBER_DATA.POST_WithRole)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.POST_RECEIVE_WithRole));
        });
    });

    describe('/POST Many member', () => {
        reload();

        it('with and without roles', async () => {
            return postAuthenticated('/members/bulk', await adminToken())
                .send({
                    bulk: [
                        MEMBER_DATA.POST_WithoutRoles,
                        MEMBER_DATA.POST_WithRole
                    ]
                })
                .expect(res => bodyItemMatchesObject(res, 0, MEMBER_DATA.POST_RECEIVE_WithoutRoles))
                .expect(res => bodyItemMatchesObject(res, 1, MEMBER_DATA.POST_RECEIVE_WithRole));
        });
    });

    describe('/PUT member', () => {
        reload();
        it('without section or roles', async () => {
            return putAuthenticated('/members/1', await adminToken())
                .send(MEMBER_DATA.PUT_WithoutRole)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.PUT_RECEIVE_WithoutRole));
        });

        it('with section and roles', async () => {
            return putAuthenticated('/members/1', await adminToken())
                .send(MEMBER_DATA.PUT_WithSectionAndRole)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.PUT_RECEIVE_WithSectionAndRole));
        });
    });

    describe('/PATCH member', () => {
        reload();

        it('without section or roles', async () => {
            return patchAuthenticated('/members/1', await adminToken())
                .send(MEMBER_DATA.PATCH_WithoutSectionOrRole)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.PATCH_RECEIVE_WithoutSectionOrRole));
        });

        it('with section and roles', async () => {
            return patchAuthenticated('/members/1', await adminToken())
                .send(MEMBER_DATA.PATCH_WithSectionAndRole)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.PATCH_RECEIVE_WithSectionAndRole))
        });

        it('does not clear roles on patch if roles are not touched', async () =>{
            return patchAuthenticated('/members/1', await adminToken())
                .send(MEMBER_DATA.PATCH_DoesNotClearRoles)
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.PATCH_RECEIVE_DoesNotClearRoles))
        })
    });

    describe('/DELETE member', () => {
        // @ts-ignore
        beforeAll(async () => await global.testDataManager.populateTablesWithTestData());
        it('delete member by id', async () => {
            return deleteAuthenticated('/members/1', await adminToken())
                .expect(res => bodyMatchesObject(res, MEMBER_DATA.DELETE_RECEIVE));
        });
    });
});

const MEMBER_DATA = {
    POST_WithoutRoles: {
        "email": "test1@web.de",
        "firstName": "testFirstName",
        "lastName": "testLastName",
        "performanceCount": 600,
        "password": "test1Password",
        "sectionId": 2
    },
    POST_RECEIVE_WithoutRoles: {
        "email": "test1@web.de",
        "firstName": "testFirstName",
        "isDeleted": false,
        "lastName": "testLastName",
        "performanceCount": 600,
        "roles": [
            {
                "roleId": 200,
                "roleName": "member",
            }
        ]
    },
    POST_WithRole: {
        "email": "test2@web.de",
        "firstName": "test2FirstName",
        "lastName": "test2LastName",
        "performanceCount": 600,
        "password": "test2Password",
        "roles": [
            {
                "roleId": 0,
                "roleName": "admin",
            }
        ],
        "section": {
            "sectionId": 2,
            "sectionName": "Marschtrommler"
        }
    },
    POST_RECEIVE_WithRole: {
        "email": "test2@web.de",
        "firstName": "test2FirstName",
        "isDeleted": false,
        "lastName": "test2LastName",
        "performanceCount": 600,
        "roles": [
            {
                "roleId": 0,
                "roleName": "admin",
            },
            {
                "roleId": 200,
                "roleName": "member",
            }
        ],
        "section": {
            "sectionId": 2,
            "sectionName": "Marschtrommler",
        }
    },
    PUT_WithoutRole: {
        "memberId": 1,
        "email": "kevin1@web.de",
        "firstName": "kevin1",
        "lastName": "Thuermann1",
        "performanceCount": 0,
        "password": "new password"
    },
    PUT_RECEIVE_WithoutRole: {
        "memberId": 1,
        "email": "kevin1@web.de",
        "firstName": "kevin1",
        "lastName": "Thuermann1",
        "performanceCount": 0
    },
    PUT_WithSectionAndRole: {
        "memberId": 1,
        "email": "kevin1@web.de",
        "firstName": "kevin1",
        "lastName": "Thuermann1",
        "performanceCount": 0,
        "password": "new password",
        "roles": [
            {
                "roleId": 1,
                "roleName": "webadmin",
            }
        ],
        "section": {
            "sectionId": 1,
            "sectionName": "Hochtrommler"
        }
    },
    PUT_RECEIVE_WithSectionAndRole: {
        "memberId": 1,
        "email": "kevin1@web.de",
        "firstName": "kevin1",
        "lastName": "Thuermann1",
        "performanceCount": 0,
        "roles": [
            {
                "roleId": 1,
                "roleName": "webadmin",
            },
            {
                "roleId": 200,
                "roleName": "member",
            }
        ],
        "section": {
            "sectionId": 1,
            "sectionName": "Hochtrommler",
        }
    },
    PATCH_WithoutSectionOrRole: {
        "email": "kevin1@web.de",
        "firstName": "kevin1",
    },
    PATCH_RECEIVE_WithoutSectionOrRole: {
        "memberId": 1,
        "email": "kevin1@web.de",
        "firstName": "kevin1",
    },
    PATCH_WithSectionAndRole: {
        "firstName": "kevin25",
        "roles": [
            {"roleId": 25, "roleName": "newsMan"}
        ],
        "section": {
            "sectionId": 1,
        }
    },
    PATCH_RECEIVE_WithSectionAndRole: {
        "memberId": 1,
        "firstName": "kevin25",
        "roles": [
            {"roleId": 25, "roleName": "newsMan"},
            {"roleId": 200, "roleName": "member"}
        ],
        "section": {"sectionId": 1}
    },
    PATCH_DoesNotClearRoles: {
        "firstName": "kevin25",
        "section": {
            "sectionId": 1,
        }
    },
    PATCH_RECEIVE_DoesNotClearRoles: {
        "memberId": 1,
        "firstName": "kevin25",
        "roles": [
            {"roleId": 0, "roleName": "admin"},
            {"roleId": 1, "roleName": "webadmin"},
            {"roleId": 100, "roleName": "planner"},
            {"roleId": 200, "roleName": "member"},
        ],
        "section": {"sectionId": 1}
    },
    DELETE_RECEIVE: {
        "memberId": 1,
        "email": "kevin.thuermann@web.de",
        "firstName": "Kevin",
        "lastName": "Thürmann",
        "performanceCount": 600,
        "isDeleted": true,
    },
};


