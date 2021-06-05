import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../src/app/app.module";
import {TestDataManager} from "../TestData/TestDataManager";
import {getConnection} from "typeorm";

export async function setupTestEnvironment() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    let testApp = moduleFixture.createNestApplication();
    await testApp.init();
    let testDataManager = new TestDataManager(getConnection());
    await testDataManager.populateTablesWithTestData();
    return {
        testApp,
        testDataManager
    };
}
