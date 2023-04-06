import {ConsoleLogger, Injectable, Scope} from '@nestjs/common';
import {LoggerConfig} from "../config/config";
import {ConfigService} from "../config/config.service";
import * as Sentry from "@sentry/node";
import {DEFAULT_LOG_LEVELS, LogLevel} from "./logLevels";

/**
 * Just used for Local Logging, Errors came through Sentry
 */
@Injectable({scope: Scope.TRANSIENT})
export class ApplicationLogger extends ConsoleLogger {
    private config: LoggerConfig;
    private enabledLogLevels: string[];

    constructor(private readonly configService: ConfigService) {
        super();
        this.config = configService.config.logger;
        this.enabledLogLevels = DEFAULT_LOG_LEVELS.slice(DEFAULT_LOG_LEVELS.indexOf(this.config.level) || 0)
    }

    setContext(context: string) {
        this.context = context
    }

    log(message: any, context?: string): any {
        if (this.logLevelIsDisabled(LogLevel.LOG)) return;
        super.log(message, context);
    };

    error(e: Error, context?: string): any {
        if (this.logLevelIsDisabled(LogLevel.ERROR)) return;
        super.error(e.message, e.stack, context);
        if (this.config.sentry) {
            Sentry.captureException(e)
        }
    };

    warn(message: any, context?: string): any {
        if (this.logLevelIsDisabled(LogLevel.WARN)) return;
        super.warn(message, context);
        if (this.config.sentry) {
            Sentry.captureMessage(message, "warning");
        }
    };

    debug(message: any, context?: string): any {
        if (this.logLevelIsDisabled(LogLevel.DEBUG)) return;
        super.debug(message, context);
    };

    verbose(message: any, context?: string): any {
        if (this.logLevelIsDisabled(LogLevel.VERBOSE)) return;
        super.verbose(message, context);
    };

    private logLevelIsDisabled(logLevel: LogLevel) {
        if (!this.config.isEnabled) return true;
        return !this.enabledLogLevels.includes(logLevel);
    }
}
