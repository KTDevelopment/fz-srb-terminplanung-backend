import {ConfigService} from "../../src/config/config.service";
import {AppConfig} from "../../src/config/config";

export function configServiceMock(mockConfig: Partial<AppConfig>): ConfigService {
    return {
        config: mockConfig
    } as any
}
