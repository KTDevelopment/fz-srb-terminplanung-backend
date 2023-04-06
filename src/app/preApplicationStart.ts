import {ApplicationLogger} from "../logger/application-logger.service";
import {ConfigService} from "../config/config.service";
import {AppException} from "../_common/AppException";
import { DataSource } from "typeorm"

export async function runMigrations(configService: ConfigService, logger: ApplicationLogger) {
    if (configService.config.database.type !== 'mysql') return;

    try {
        logger.debug("try to run migrations")
        const dataSource = new DataSource({...configService.config.database, logging: true});
        await dataSource.initialize();
        await dataSource.runMigrations();
        await dataSource.destroy();
        logger.debug("migrations finished")
    } catch (e) {
        logger.error(new AppException(e, "run migrations failed"));
        throw e
    }
}
