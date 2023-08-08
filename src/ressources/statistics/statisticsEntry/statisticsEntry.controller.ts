import {Body, Controller, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {Crud, CrudAuth, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Member} from "../../members/member.entity";
import {Auth} from "../../../auth/auth.decorator";
import {Roles} from "../../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_PLANNER} from "../../roles/role.entity";
import {StatisticsEntry} from "./statisticsEntry.entity";
import {StatisticsEntryService} from "./statisticsEntry.service";
import {TransformInstanceToPlain} from "class-transformer";
import {CreateFromEventDto} from "./dto/CreateFromEventDto";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: StatisticsEntry
    },
    query: {
        maxLimit: 100,
    },
    routes: {
        exclude: ["recoverOneBase"],
        getManyBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        getOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        createOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        createManyBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        updateOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        replaceOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER)]
        },
        deleteOneBase: {
            returnDeleted: true,
        },
    }
})
@CrudAuth({
    property: 'user',
    filter: (member: Member) => {
        if (member.isPlanner() && !member.isAdmin()) {
            return {sectionId: member.sectionId}
        }
    },
})
@ApiTags('statisticsEntries')
@Controller('api/v2/statisticsEntries')
export class StatisticsEntryController implements CrudController<StatisticsEntry> {
    constructor(public service: StatisticsEntryService) {
    }

    @Auth(ROLE_ID_ADMIN)
    @UsePipes(new ValidationPipe({transform: true}))
    @Post("/fromEvent")
    @TransformInstanceToPlain()
    async deleteMany(@Body() dto: CreateFromEventDto): Promise<StatisticsEntry[]> {
        return this.service.createFromEvent(dto)
    }
}
