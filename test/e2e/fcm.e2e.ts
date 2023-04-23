import {post, postAuthenticated} from "./_common/testRequests";
import {bodyMatchesObject} from "./_common/expectations";
import {setUpE2E} from "./setup/e2e-setup";
import {adminToken} from "./_common/helper";
import {
    STATE__ATTEND,
    STATE__INVITED
} from "../../src/ressources/participations/participation-states/participation-state.entity";

setUpE2E()

describe('FCM', () => {
    describe('/POST remindParticipators', () => {
        it('it should be behind auth', async () => {
            return post('/fcm/remindParticipators')
                .expect(401)
        });
        it('it should return 400 on empty body', async () => {
            return postAuthenticated('/fcm/remindParticipators', await adminToken())
                .expect(400)
        });
        it('it should return 400 on wrong body', async () => {
            return postAuthenticated('/fcm/remindParticipators', await adminToken())
                .send({
                    wrongBody: "foo"
                })
                .expect(400)
        });
        it('it remind one member', async () => {
            return postAuthenticated('/fcm/remindParticipators', await adminToken())
                .send({
                    remindRequests: [
                        {
                            memberId: 2,
                            eventId: 2,
                            stateId: STATE__INVITED,
                        }
                    ]
                })
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "remind": "successful",
                }))
        });
        it('it remind multiple members', async () => {
            return postAuthenticated('/fcm/remindParticipators', await adminToken())
                .send({
                    remindRequests: [
                        {
                            memberId: 3,
                            eventId: 1,
                            stateId: STATE__INVITED,
                        },
                        {
                            memberId: 2,
                            eventId: 2,
                            stateId: STATE__ATTEND,
                        }
                    ]
                })
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "remind": "successful",
                }))
        });
    });
});
