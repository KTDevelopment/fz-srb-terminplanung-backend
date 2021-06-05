import {ApplicationLogger} from "./logger/application-logger.service";
import {ConfigService} from "./config/config.service";
import {runMigrations} from "./app/preApplicationStart";
import {App} from "./app/app";
import {AppException} from "./_common/AppException";
import {initSentry} from "./app/app.reporter";

const configService = new ConfigService();
initSentry(configService);
const mainLogger = new ApplicationLogger(configService);
mainLogger.setContext('main');

(async () => {
    await runMigrations(configService, mainLogger);
    await App.create(configService, mainLogger).start();
})().catch(e => {
    mainLogger.error(new AppException(e, 'application startup failed'));
    process.exit(1);
});
