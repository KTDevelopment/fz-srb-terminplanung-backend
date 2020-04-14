import {Module} from '@nestjs/common';
import {EventsController} from './events.controller';
import {EventsService} from './events.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Event} from "./event.entity";
import {IcsModule} from "../../ics/ics.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        IcsModule
    ],
    controllers: [EventsController],
    exports: [EventsService],
    providers: [EventsService]
})
export class EventsModule {
}
