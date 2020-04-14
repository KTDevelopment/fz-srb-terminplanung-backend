import {Controller} from '@nestjs/common';
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Role, ROLE_ID_ADMIN} from "./role.entity";
import {RolesService} from "./roles.service";
import {Auth} from "../../auth/auth.decorator";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: Role
    },
    params: {
        roleId: {
            field: 'roleId',
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
    }
})
@ApiTags('roles')
@Controller('api/v2/roles')
export class RolesController implements CrudController<Role> {
    constructor(public service: RolesService) {
    }
}
