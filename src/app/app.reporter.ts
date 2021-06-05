import * as Sentry from "@sentry/node";
import {RewriteFrames} from "@sentry/integrations";
import {version} from "../../package.json";
import {ConfigService} from "src/config/config.service";

export function initSentry(configService: ConfigService) {
    if (configService.config.logger.sentry) {
        Sentry.init({
            dsn: configService.config.logger.sentry.dsn,
            integrations: [new RewriteFrames({
                root: configService.config.logger.sentry.rootDir,
            })],
            release: configService.config.logger.sentry.releaseTemplate + version,
            environment: configService.config.logger.sentry.environment
        });
    }
}
