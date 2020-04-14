import {Controller} from '@nestjs/common';
import {Crud, CrudAuth, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Anniversary} from "./anniversary.entity";
import {AnniversariesService} from "./anniversaries.service";
import {Roles} from "../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_MEMBER} from "../roles/role.entity";
import {Auth} from "../../auth/auth.decorator";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: Anniversary
    },
    params: {
        anniversaryId: {
            field: 'anniversaryId',
            type: 'number',
            primary: true,
        },
    },
    query: {
        join: {
            member: {
                //@ts-ignore
                condition: 'isDeleted = 0'
            },
            event: {}
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
            return {memberId: member.memberId}
        }
    }
})
@ApiTags('anniversaries')
@Controller('api/v2/anniversaries')
export class AnniversariesController implements CrudController<Anniversary> {
    constructor(public service: AnniversariesService) {
    }
}
