export enum LogLevel {
    DEBUG = "DEBUG",
    VERBOSE = "VERBOSE",
    LOG = "LOG",
    WARN = "WARN",
    ERROR = "ERROR",
}

export const DEFAULT_LOG_LEVELS = Object.keys(LogLevel).map(key => LogLevel[key]);
