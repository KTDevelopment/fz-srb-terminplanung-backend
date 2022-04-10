import {ConfigGateway} from "../gateways/ConfigGateway";
import {ConfigService} from "../../config/config.service";

export class BackupConfigService implements ConfigGateway {

    constructor(
        private readonly configService: ConfigService
    ) {

    }

    getCurrentEnvironment(): string {
        return this.configService.config.env;
    }

    getTempDir(): string {
        return this.configService.config.backup.tempDirectory;
    }

}
