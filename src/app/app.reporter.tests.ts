import {initSentry} from "./app.reporter";
import * as Sentry from "@sentry/node";
import {configServiceMock} from "../../test/mocks/configServiceMock";
import {LogLevel} from "../logger/logLevels";

describe('App Reporter', () => {
    // @ts-ignore
    Sentry.init = jest.fn();
    it('inits sentry if configured', async () => {
        initSentry(configServiceMock({
            logger: {
                isEnabled: true,
                level: LogLevel.DEBUG,
                sentry: {
                    dsn: 'foo',
                    environment: 'env',
                    releaseTemplate: 'template',
                    rootDir: 'rootDir'
                }
            }
        }));
        expect(Sentry.init).toBeCalled();
    });

    it('do nothing if not configured', async () => {
        initSentry(configServiceMock({
            logger: {
                isEnabled: true,
                level: LogLevel.DEBUG
            }
        }));
        expect(Sentry.init).not.toBeCalled();
    });
});
