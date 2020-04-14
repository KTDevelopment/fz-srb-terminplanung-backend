import {Injectable, Logger, Scope} from '@nestjs/common';
import {LoggerConfig} from "../config/config";
import {ConfigService} from "../config/config.service";

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

    error(message: any, trace?: string, context?: string): any {
        if (!this.config.isEnabled) return;
        super.error(message, trace, context);
    };

    warn(message: any, context?: string): any {
        if (!this.config.isEnabled) return;
        super.warn(message, context);
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
