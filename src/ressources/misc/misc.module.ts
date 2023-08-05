import {Module} from '@nestjs/common';
import {MiscService} from './misc.service';
import {MiscController} from './misc.controller';

@Module({
    providers: [MiscService],
    controllers: [MiscController]
})
export class MiscModule {
}
