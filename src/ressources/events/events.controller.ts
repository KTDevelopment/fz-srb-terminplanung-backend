import {Controller} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {Crud, CrudController} from "@nestjsx/crud";
import {Event} from "./event.entity";
import {EventsService} from "./events.service";
import {Auth} from "../../auth/auth.decorator";
import {ROLE_ID_ADMIN} from "../roles/role.entity";

@Crud({
    model: {
        type: Event
    },
    query: {
        maxLimit: 500,
    },
    params: {
        eventId: {
            field: 'eventId',
            type: 'number',
            primary: true,
        },
    },
    routes: {
        createOneBase: {
            decorators: [Auth(ROLE_ID_ADMIN)],
        },
        createManyBase: {
            decorators: [Auth(ROLE_ID_ADMIN)],
        },
        deleteOneBase: {
            decorators: [Auth(ROLE_ID_ADMIN)],
        },
        updateOneBase: {
            decorators: [Auth(ROLE_ID_ADMIN)],
        },
        replaceOneBase: {
            decorators: [Auth(ROLE_ID_ADMIN)],
        }
    },
})
@ApiTags('events')
@Controller('api/v2/events')
export class EventsController implements CrudController<Event> {
    constructor(public service: EventsService) {
    }
}
