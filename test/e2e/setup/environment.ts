import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../../src/app/app.module";
import {TestDataManager} from "../TestData/TestDataManager";
import {getDataSourceToken} from "@nestjs/typeorm";
import {DataSource} from "typeorm/data-source/DataSource";

export async function setupTestEnvironment() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    let testApp = moduleFixture.createNestApplication();
    await testApp.init();

    let testDataManager = new TestDataManager(await testApp.resolve(getDataSourceToken()) as DataSource);
    await testDataManager.populateTablesWithTestData();
    return {
        testApp,
        testDataManager
    };
}
