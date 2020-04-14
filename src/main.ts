import {ApplicationLogger} from "./logger/application-logger.service";
import {ConfigService} from "./config/config.service";
import {runMigrations} from "./preApplicationStart";
import {App} from "./app";

const configService = new ConfigService();
const mainLogger = new ApplicationLogger(configService);
mainLogger.setContext('main');

(async () => {
    await runMigrations(mainLogger);
    await new App(configService, mainLogger).start();
    mainLogger.log('application startup completed')
})().catch(e => {
    mainLogger.error('application startup failed');
    mainLogger.error(e.message, e.stack);
    process.exit(1);
});
