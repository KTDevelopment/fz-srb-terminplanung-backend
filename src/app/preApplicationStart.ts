import {createConnection} from "typeorm";
import {ApplicationLogger} from "../logger/application-logger.service";
import {ConfigService} from "../config/config.service";
import {AppException} from "../_common/AppException";

export async function runMigrations(configService: ConfigService, logger: ApplicationLogger) {
    if (configService.config.database.type !== 'mysql') return;

    try {
        const connection = await createConnection({...configService.config.database, logging: true});
        await connection.runMigrations();
        await connection.close();
        logger.debug("migrations finished")
    } catch (e) {
        logger.error(new AppException(e, "run migrations failed"));
    }
}
