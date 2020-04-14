import {Controller} from '@nestjs/common';
import {Crud, CrudAuth, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Section} from "./section.entity";
import {SectionsService} from "./sections.service";
import {Roles} from "../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_MEMBER} from "../roles/role.entity";
import {Auth} from "../../auth/auth.decorator";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: Section
    },
    params: {
        sectionId: {
            field: 'sectionId',
            type: 'number',
            primary: true,
        },
    },
    query: {
        join: {
            members: {
                //@ts-ignore
                condition: 'isDeleted = 0'
            }
        }
    },
    routes: {
        getOneBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        getManyBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        }
    }
})
@CrudAuth({
    property: 'user',
    filter: member => {
        if (member.isNotPrivileged()) {
            return {sectionId: member.sectionId}
        }
        if (member.isPlanner() && !member.isAdmin()) {
            return {sectionId: member.sectionId}
        }
    }
})
@ApiTags('sections')
@Controller('api/v2/sections')
export class SectionsController implements CrudController<Section> {
    constructor(public service: SectionsService) {
    }
}
