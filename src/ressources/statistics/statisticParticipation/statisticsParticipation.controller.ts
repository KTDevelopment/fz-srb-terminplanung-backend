import {Body, Controller, Delete, UseInterceptors, UsePipes, ValidationPipe} from '@nestjs/common';
import {Crud, CrudAuth, CrudController, CrudRequest, CrudRequestInterceptor, ParsedRequest} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Member} from "../../members/member.entity";
import {StatisticsParticipation} from "./statisticsParticipation.entity";
import {StatisticsParticipationService} from "./statisticsParticipation.service";
import {Auth} from "../../../auth/auth.decorator";
import {Roles} from "../../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_PLANNER} from "../../roles/role.entity";
import {TransformInstanceToPlain} from "class-transformer";
import {DeleteManyStatisticsParticipations} from "./dto/DeleteManyStatisticsParticipations";

@Auth()
@Crud({
    model: {
        type: StatisticsParticipation
    },
    query: {
        join: {
            member: {
                //@ts-ignore
                condition: 'isDeleted = 0',
                eager: true,
            },
            statisticsEntry: {},
        },
        maxLimit: 100,
    },
    routes: {
        exclude: ["replaceOneBase", "updateOneBase", "recoverOneBase"],
        createOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER, ROLE_ID_ADMIN)]
        },
        createManyBase: {
            decorators: [Roles(ROLE_ID_PLANNER, ROLE_ID_ADMIN)]
        },
        deleteOneBase: {
            decorators: [Roles(ROLE_ID_PLANNER, ROLE_ID_ADMIN)]
        }
    }
})
@CrudAuth({
    property: 'user',
    filter: (member: Member) => {
        if (member.isNotPrivileged()) {
            return {memberId: member.memberId}
        }
        if (member.isPlanner() && !member.isAdmin()) {
            return {"member.sectionId": member.sectionId}
        }
    },
    persist: (user: Member) => user, //bypass the calling Member here for fcm usage
})
@ApiTags('statisticsParticipations')
@Controller('api/v2/statisticsParticipations')
export class StatisticsParticipationController implements CrudController<StatisticsParticipation> {
    constructor(public service: StatisticsParticipationService) {
    }

    @UseInterceptors(CrudRequestInterceptor)
    @Auth(ROLE_ID_ADMIN, ROLE_ID_PLANNER)
    @UsePipes(new ValidationPipe({transform: true}))
    @Delete("/bulk")
    @TransformInstanceToPlain()
    async deleteMany(@ParsedRequest() req: CrudRequest, @Body() dto: DeleteManyStatisticsParticipations) {
        return this.service.deleteMany(req, dto)
    }
}
