import {Body, Controller, Query} from '@nestjs/common';
import {CreateManyDto, Crud, CrudAuth, CrudController, CrudRequest, Override, ParsedRequest} from "@nestjsx/crud";
import {MembersService} from "./members.service";
import {Member} from "./member.entity";
import {ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ParseBooleanPipe} from "../../_common/ParseBooleanPipe";
import {Roles} from "../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_PLANNER} from "../roles/role.entity";
import {Auth} from "../../auth/auth.decorator";

@Auth()
@Crud({
    model: {
        type: Member
    },
    params: {
        memberId: {
            field: 'memberId',
            type: 'number',
            primary: true,
        },
    },
    query: {
        join: {
            section: {},
            roles: {
                eager: true,
            },
            devices: {},
        }
    },
    routes: {
        updateOneBase: {
            returnShallow: true,
            decorators: [Roles(ROLE_ID_ADMIN)]
        },
        replaceOneBase: {
            returnShallow: true,
            decorators: [Roles(ROLE_ID_ADMIN)]
        },
        deleteOneBase: {
            decorators: [Roles(ROLE_ID_ADMIN)]
        }
    }
})
@CrudAuth({
    property: 'user',
    filter: member => {
        if (member.isNotPrivileged()) {
            return {memberId: member.memberId}
        }
        if (member.isPlanner() && !member.isAdmin()) {
            return {sectionId: member.sectionId}
        }
    }
})
@ApiTags('members')
@Controller('api/v2/members')
export class MembersController implements CrudController<Member> {
    constructor(public service: MembersService) {
    }

    get base(): CrudController<Member> {
        return this;
    }

    @ApiQuery({name: 'includeDeleted', type: 'boolean', required: false})
    @ApiResponse({status: 200, type: [Member]})
    @Roles(ROLE_ID_ADMIN, ROLE_ID_PLANNER)
    @Override()
    getMany(
        @ParsedRequest() req: CrudRequest,
        @Query('includeDeleted', ParseBooleanPipe) includeDeleted?: boolean
    ) {
        if (!includeDeleted) {
            MembersController.addFieldToSearch(req, 'isDeleted', false);
        }

        return this.base.getManyBase(req);
    }

    @Roles(ROLE_ID_ADMIN)
    @Override() // override is needed because password would get lost on parsing by nestCRUD
    createOne(@ParsedRequest() req: CrudRequest, @Body() dto: Member): Promise<Member> {
        return this.base.createOneBase(req, dto);
    };

    @Roles(ROLE_ID_ADMIN)
    @Override() // override is needed because password would get lost on parsing by nestCRUD
    createMany(@ParsedRequest() req: CrudRequest, @Body() dto: CreateManyDto<Member>): Promise<Member[]> {
        return this.base.createManyBase(req, dto);
    };

    @Roles(ROLE_ID_ADMIN)
    @Override() // override is needed because password would get lost on parsing by nestCRUD
    updateOne(@ParsedRequest() req: CrudRequest, @Body() dto: Member): Promise<Member> {
        return this.base.updateOneBase(req, dto);
    };

    private static addFieldToSearch(req: CrudRequest, field: string, value: string | number | boolean) {
        req.parsed.search['$and'].push({
            [field]: {'$eq': value}
        })
    }

}
