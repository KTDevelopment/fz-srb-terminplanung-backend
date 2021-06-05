import typeorm = require('typeorm');
import {runMigrations} from "./preApplicationStart";
import {configServiceMock} from "../../test/mocks/configServiceMock";
import {loggerMock} from "../../test/mocks/loggerMock";

describe('preApplicationStart', () => {
    const connectionMock = {
        runMigrations: jest.fn(),
        close: jest.fn(),
    }
    typeorm.createConnection = jest.fn().mockReturnValue(connectionMock);

    it('creates connection and runs migrations for database type mysql', async () => {
        await runMigrations(configServiceMock({database: {type: 'mysql'}}), loggerMock);

        expect(typeorm.createConnection).toBeCalled();
        expect(connectionMock.runMigrations).toBeCalled();
        expect(connectionMock.close).toBeCalled();
    });

    it('do nothing for database type other than mysql', async () => {
        await runMigrations(configServiceMock({database: {type: 'sqlite'}}), loggerMock);

        expect(typeorm.createConnection).not.toBeCalled();
        expect(connectionMock.runMigrations).not.toBeCalled();
        expect(connectionMock.close).not.toBeCalled();
    });

    it('handles errors', async () => {
        connectionMock.runMigrations.mockRejectedValue(new Error('caboom'));
        await runMigrations(configServiceMock({database: {type: 'mysql'}}), loggerMock);

        expect(typeorm.createConnection).toBeCalled();
        expect(connectionMock.runMigrations).toBeCalled();
        expect(connectionMock.close).not.toBeCalled();
        expect(loggerMock.error).toBeCalled();
    });

});
