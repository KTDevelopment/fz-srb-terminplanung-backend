import {setupTestEnvironment} from "./environment";
import {login} from "../_common/testRequests";

export function setUpE2E() {

    beforeAll(async () => {
        const testEnv = (await setupTestEnvironment());
        // @ts-ignore
        global.testApp = testEnv.testApp;
        // @ts-ignore
        global.testDataManager = testEnv.testDataManager;
        const response = await login('alexandra.michel@web.de', 'password_alexandra');
        // @ts-ignore
        global.accessToken = response.body.accessToken;
        // @ts-ignore
        global.refreshToken = response.body.refreshToken;
    });

    afterAll(async () => {
        // @ts-ignore
        await global.testApp.close();
    });
}
