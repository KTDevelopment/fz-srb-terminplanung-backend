import {ApplicationLogger} from "./logger/application-logger.service";
import {ConfigService} from "./config/config.service";
import {runMigrations} from "./preApplicationStart";
import {App} from "./app";
import {AppException} from "./_common/AppException";

const configService = new ConfigService();
const mainLogger = new ApplicationLogger(configService);
mainLogger.setContext('main');

(async () => {
    if (configService.config.database.type === 'mysql') {
        await runMigrations(configService, mainLogger);
    }
    const app = await new App(configService, mainLogger)
        .start();
    mainLogger.log('application startup completed: ' + await app.getUrl())
})().catch(e => {
    mainLogger.error(new AppException(e, 'application startup failed'));
    process.exit(1);
});
