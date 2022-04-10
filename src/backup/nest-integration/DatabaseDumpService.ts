import mysqldump from "mysqldump";
import {DumpGateway} from "../gateways/DumpGateway";
import {DatabaseAccessConfig} from "../config/DatabaseAccessConfig";

export class DatabaseDumpService implements DumpGateway {

    constructor(
        private readonly databaseAccessConfig: DatabaseAccessConfig,
    ) {
    }

    async createDumpAndSaveTo(absoluteFileName: string) {
        await mysqldump({
            connection: {
                host: this.databaseAccessConfig.host,
                port: this.databaseAccessConfig.port,
                user: this.databaseAccessConfig.username,
                password: this.databaseAccessConfig.password,
                database: this.databaseAccessConfig.database,
            },
            dumpToFile: absoluteFileName,
        });
    }

}
