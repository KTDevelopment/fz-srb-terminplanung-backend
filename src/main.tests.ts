import {runMigrations} from "./app/preApplicationStart";
import {App} from "./app/app";

jest.genMockFromModule('./app/preApplicationStart');
jest.mock('./app/preApplicationStart');

describe('main', () => {
    const appMock = {
        start: jest.fn()
    }
    App.create = jest.fn().mockReturnValue(appMock);
    process.exit = jest.fn() as any;

    it('creates app runs migrations for mysql and handle error', async () => {
        appMock.start.mockRejectedValue(new Error('caboom'));

        await import("./main");
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(runMigrations).toBeCalled();
        expect(appMock.start).toBeCalled();
        expect(process.exit).toBeCalled();
    });
});
