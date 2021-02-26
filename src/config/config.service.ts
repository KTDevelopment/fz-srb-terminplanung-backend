import {Injectable, OnModuleInit} from '@nestjs/common';
import {AppConfig, Config, Environment} from "./config";
import {configValidation} from "./config.validation";

@Injectable()
export class ConfigService implements OnModuleInit {
    config: AppConfig;

    constructor() {
        this.config = Config();
    }

    async onModuleInit(): Promise<void> {
        await configValidation().validateAsync(this.config, {
            presence: "required",
            allowUnknown: this.config.env === Environment.TEST,
            abortEarly: true
        })
    }

    get<T = any>(configKey: keyof AppConfig): T {
        return this.config[configKey];
    }
}
