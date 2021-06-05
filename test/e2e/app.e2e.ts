import {get} from "./_common/testRequests";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('App', () => {
    describe('/GET redirects', () => {
        it.each(['', '/termsAndConditions', '/privacyPolicy', '/contact'])('it should get redirect on %s', async (url) => {
            return get(url, '')
                .expect(303);
        });
    });

});
