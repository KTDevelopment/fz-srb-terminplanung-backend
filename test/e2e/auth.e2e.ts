import {loginResponse} from "./_common/expectations";
import {login, post} from "./_common/testRequests";
import {setUpE2E} from "./setup/e2e-setup";

setUpE2E()

describe('Login', () => {
    describe('/POST login', () => {
        it('it should login user kevin', async () => {
            return login('kevin.thuermann@web.de', 'password_kevin')
                .expect(201)
                .expect(loginResponse);
        });

        it('it should refresh Login with valid refreshToken', async () => {
            return post('/auth/refresh')
                .send({
                    // @ts-ignore
                    refreshToken: global.refreshToken,
                })
                .expect(201)
                .expect(loginResponse);
        });
    });
});
