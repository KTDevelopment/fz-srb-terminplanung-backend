import {createConnection} from "typeorm";
import {ApplicationLogger} from "./logger/application-logger.service";
import {ConfigService} from "./config/config.service";

export async function runMigrations(configService: ConfigService, logger: ApplicationLogger) {
    try {
        const connection = await createConnection({...configService.config.database, logging: true});
        await connection.runMigrations();
        await connection.close();
    } catch (e) {
        logger.error('run migrations failed');
        logger.error(e.message, e.stack);
    }
}
