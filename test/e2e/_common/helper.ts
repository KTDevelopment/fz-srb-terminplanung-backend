import {login} from "./testRequests";

export function reload() {
    // @ts-ignore
    beforeAll(async () => await global.testDataManager.clearData());
    // @ts-ignore
    beforeEach(async () => await global.testDataManager.populateTablesWithTestData());
    // @ts-ignore
    afterEach(async () => await global.testDataManager.clearData());
}

export async function adminToken(): Promise<string> {
    return (await login('kevin.thuermann@web.de', 'password_kevin')).body.accessToken
}
