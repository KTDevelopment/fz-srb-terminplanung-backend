import {
    deleteAuthenticated,
    getAuthenticated,
    login,
    patchAuthenticated,
    postAuthenticated
} from "./_common/testRequests";
import {bodyLengthEqual, bodyLengthGreaterOrEqual, bodyMatchesObject} from "./_common/expectations";
import {adminToken} from "./_common/helper";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Device', () => {
    describe('/POST device', () => {
        it('save Device as admin', async () => {
            return postAuthenticated('/devices', await adminToken())
                .send({
                    member: {memberId: 1},
                    registrationId: 'awesome_registrationsId',
                    deviceType: 'type_android'
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    registrationId: 'awesome_registrationsId',
                    deviceType: 'type_android',
                    deviceId: 3,
                    member: {memberId: 1},
                    memberId: 1,
                }))
        });
        it('save Device for himself as member', async () => {
            return postAuthenticated('/devices')
                .send({
                    deviceId: 4,
                    registrationId: 'awesome_registrationsId_member_6',
                    deviceType: 'type_android'
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    deviceId: 4,
                    registrationId: 'awesome_registrationsId_member_6',
                    deviceType: 'type_android',
                    memberId: 6
                }))
        });
        it('do not save same Device twice, even on post', async () => {
            await postAuthenticated('/devices')
                .send({
                    deviceId: 5,
                    registrationId: 'awesome_registrationsId_not_twice',
                    deviceType: 'type_ios'
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    deviceId: 5,
                    registrationId: 'awesome_registrationsId_not_twice',
                    deviceType: 'type_ios',
                    memberId: 6
                }));
            return postAuthenticated('/devices')
                .send({
                    registrationId: 'awesome_registrationsId_not_twice',
                    deviceType: 'type_ios'
                })
                .expect(201)
                .expect(res => bodyMatchesObject(res, {
                    deviceId: 5,
                    registrationId: 'awesome_registrationsId_not_twice',
                    deviceType: 'type_ios',
                    memberId: 6
                }));
        });
    });

    describe('/Patch', () => {
        it('updates Device Token for own device as member', async () => {
            return patchAuthenticated('/devices/4')
                .send({
                    registrationId: 'awesome_registrationsId_member_6_updated',
                    deviceType: 'type_android'
                })
                .expect(200)
                .expect(res => bodyMatchesObject(res, {
                    registrationId: 'awesome_registrationsId_member_6_updated',
                    deviceType: 'type_android',
                }))
        });
    });

    describe('/Delete one Device', () => {
        it('delete own Device', async () => {
            return deleteAuthenticated('/devices/4')
                .send({
                    registrationId: 'awesome_registrationsId_updated',
                    deviceType: 'type_android'
                })
                .expect(200)
                .expect(res => bodyMatchesObject(res, {}));
        });

        it('delete one Device as admin', async () => {
            return deleteAuthenticated('/devices/1', await adminToken())
                .send({
                    registrationId: 'awesome_registrationsId_updated',
                    deviceType: 'type_android'
                })
                .expect(200)
                .expect(res => bodyMatchesObject(res, {}));
        });
    });

    describe('/GET devices', () => {
        it('should get devices for admin', async () => {
            return getAuthenticated('/devices', await adminToken())
                .expect(200)
                .expect(res => bodyLengthGreaterOrEqual(res, 2))
        });
        it('should get only own devices for member who is no admin', async () => {
            return getAuthenticated('/devices', (await login('jasmin.schilke@web.de', 'password_jasmin')).body.accessToken)
                .expect(200)
                .expect(res => bodyLengthEqual(res, 1));
        })
    })
});
