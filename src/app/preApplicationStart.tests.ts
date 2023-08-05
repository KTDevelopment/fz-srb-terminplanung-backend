import {runMigrations} from "./preApplicationStart";
import {configServiceMock} from "../../test/mocks/configServiceMock";
import {loggerMock} from "../../test/mocks/loggerMock";
import {DataSource} from "typeorm"

const dataSourceMock = {
    initialize: jest.fn(),
    runMigrations: jest.fn(),
    destroy: jest.fn(),
};
jest.mock("typeorm", () => ({
    DataSource: jest.fn().mockImplementation(() => {
        return dataSourceMock;
    }),
}));

describe('preApplicationStart', () => {

    it('creates dataSource and runs migrations for database type mysql', async () => {
        await runMigrations(configServiceMock({database: {type: 'mysql'} as any}), loggerMock);

        expect(DataSource).toBeCalled();
        expect(dataSourceMock.initialize).toBeCalled();
        expect(dataSourceMock.runMigrations).toBeCalled();
        expect(dataSourceMock.destroy).toBeCalled();
    });

    it('do nothing for database type other than mysql', async () => {
        await runMigrations(configServiceMock({database: {type: 'sqlite'} as any}), loggerMock);

        expect(DataSource).not.toBeCalled();
        expect(dataSourceMock.initialize).not.toBeCalled();
        expect(dataSourceMock.runMigrations).not.toBeCalled();
        expect(dataSourceMock.destroy).not.toBeCalled();
    });

    it('handles errors', async () => {
        dataSourceMock.runMigrations.mockRejectedValue(new Error('caboom'));
        try {
            await runMigrations(configServiceMock({database: {type: 'mysql'} as any}), loggerMock);
        } catch (e) {
            // do nothing
        }

        expect(DataSource).toBeCalled();
        expect(dataSourceMock.initialize).toBeCalled();
        expect(dataSourceMock.runMigrations).toBeCalled();
        expect(dataSourceMock.destroy).not.toBeCalled();
        expect(loggerMock.error).toBeCalled();
    });

});
