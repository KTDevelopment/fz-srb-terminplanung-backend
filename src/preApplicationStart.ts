import {createConnection} from "typeorm";
import {Config} from "./config/config";
import {ApplicationLogger} from "./logger/application-logger.service";

export async function runMigrations(logger: ApplicationLogger) {
    try {
        const connection = await createConnection({...Config().database, logging: true});
        await connection.runMigrations();
        await connection.close();
    } catch (e) {
        logger.error('run migrations failed');
        logger.error(e.message, e.stack);
    }
}
