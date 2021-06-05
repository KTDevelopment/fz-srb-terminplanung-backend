import {ApplicationLogger} from "../../src/logger/application-logger.service";

export const loggerMock = {
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn()
} as any as ApplicationLogger;
