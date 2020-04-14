import {bodyMatchesObject} from "./_common/expectations";
import {get} from "./_common/testRequests";

describe('Misc', () => {
    describe('/GET AppStoreLinks', () => {
        it('it should GET misc without authorization', async () => {
            return get('/misc')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "description": "misc stuff",
                }))
        });
        it('it should GET appStoreLinks without authorization', async () => {
            return get('/misc/fzSrbAppStoreLinks')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "androidLink": "foo_android",
                    "iosLink": "foo_ios",
                }));
        });
    });
});

