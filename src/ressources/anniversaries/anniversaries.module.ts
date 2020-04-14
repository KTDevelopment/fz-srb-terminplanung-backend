import {Module} from '@nestjs/common';
import {AnniversariesService} from './anniversaries.service';
import {AnniversariesController} from './anniversaries.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Anniversary} from "./anniversary.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Anniversary])],
    providers: [AnniversariesService],
    controllers: [AnniversariesController],
})
export class AnniversariesModule {
}
