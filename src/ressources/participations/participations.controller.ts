import {Controller, Get, Query, Req, UseGuards} from '@nestjs/common';
import {Crud, CrudAuth, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Participation} from "./participation.entity";
import {ParticipationsService} from "./participations.service";
import {ParticipationsGuard} from "./validation/participations-guard.service";
import {Auth} from "../../auth/auth.decorator";
import {Roles} from "../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_PLANNER} from "../roles/role.entity";
import {Member} from "../members/member.entity";
import {TransformInstanceToPlain} from "class-transformer";
import {Request} from "express";
import {Event} from "../events/event.entity";
import {ParseOptionalIntPipe} from "../../_common/ParseOptionalIntPipe";

@Auth()
@Crud({
    model: {
        type: Participation
    },
    query: {
        join: {
            member: {
                //@ts-ignore
                condition: 'isDeleted = 0',
                eager: true,
            },
            event: {},
            participationState: {}
        },
        maxLimit: 100,
    },
    routes: {
        exclude: ["replaceOneBase", "updateOneBase"],
        createOneBase: {
            decorators: [UseGuards(ParticipationsGuard)]
        },
        createManyBase: {
            decorators: [UseGuards(ParticipationsGuard)]
        },
        deleteOneBase: {
            returnDeleted: true,
            decorators: [Roles(ROLE_ID_ADMIN)]
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
@ApiTags('participations')
@Controller('api/v2/participations')
export class ParticipationsController implements CrudController<Participation> {
    constructor(public service: ParticipationsService) {
    }

    @Auth(ROLE_ID_ADMIN, ROLE_ID_PLANNER)
    @Get('unfinishedAuftritte')
    @TransformInstanceToPlain()
    async getUnfinishedAuftritte(
        @Req() request: Request,
        @Query("sectionId", ParseOptionalIntPipe) sectionIdOverride: number | undefined
    ): Promise<Event[]> {
        return await this.service.getUnfinishedAuftritte(this.determineSectionIdForUnfinishedAuftritte(request, sectionIdOverride))
    }

    private determineSectionIdForUnfinishedAuftritte(request: Request, sectionIdOverride: number | undefined): number {
        const callingMember: Member = request.user as Member
        if (callingMember.isAdmin() && sectionIdOverride) {
            return sectionIdOverride
        }

        return callingMember.sectionId
    }
}
