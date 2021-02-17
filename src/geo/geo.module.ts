import {HttpModule, Module} from '@nestjs/common';
import {GeoService} from "./geo.service";

@Module({
    imports: [HttpModule],
    providers: [GeoService],
    exports: [GeoService]
})
export class GeoModule {}
