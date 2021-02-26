import {Injectable, Logger, Scope} from '@nestjs/common';
import {LoggerConfig} from "../config/config";
import {ConfigService} from "../config/config.service";
import * as Sentry from "@sentry/node";
import {Severity} from "@sentry/types/dist/severity";

/**
 * Just used for Local Logging, Errors came throw Sentry
 */
@Injectable({scope: Scope.TRANSIENT})
export class ApplicationLogger extends Logger {
    private config: LoggerConfig;

    constructor(private readonly configService: ConfigService) {
        super();
        this.config = configService.config.logger;
    }

    log(message: any, context?: string): any {
        if (!this.config.isEnabled) return;
        super.log(message, context);
    };

    error(e: Error, context?: string): any {
        if (!this.config.isEnabled) return;
        super.error(e.message, e.stack, context);
        if (this.config.sentry) {
            Sentry.captureException(e)
        }
    };

    warn(message: any, context?: string): any {
        if (!this.config.isEnabled) return;
        super.warn(message, context);
        if (this.config.sentry) {
            Sentry.captureMessage(message, Severity.Warning);
        }
    };

    debug(message: any, context?: string): any {
        if (!this.config.isEnabled) return;
        super.debug(message, context);
    };

    verbose(message: any, context?: string): any {
        if (!this.config.isEnabled) return;
        super.verbose(message, context);
    };
}
