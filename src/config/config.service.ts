import {Injectable} from '@nestjs/common';
import {AppConfig, Config} from "./config";

@Injectable()
export class ConfigService {
    config: AppConfig;

    constructor() {
        this.config = Config();
    }

    get<T = any>(configKey: keyof AppConfig): T {
        return this.config[configKey];
    }
}
