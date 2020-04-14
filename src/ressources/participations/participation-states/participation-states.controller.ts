import {Controller} from '@nestjs/common';
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {ParticipationState} from "./participation-state.entity";
import {ParticipationStatesService} from "./participation-states.service";
import {Roles} from "../../roles/roles.decorator";
import {ROLE_ID_ADMIN, ROLE_ID_MEMBER} from "../../roles/role.entity";
import {Auth} from "../../../auth/auth.decorator";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: ParticipationState
    },
    params: {
        stateId: {
            field: 'stateId',
            type: 'number',
            primary: true,
        },
    },
    routes: {
        getOneBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        getManyBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
    }
})
@ApiTags('participation-states')
@Controller('api/v2/participation-states')
export class ParticipationStatesController implements CrudController<ParticipationState> {
    constructor(public service: ParticipationStatesService) {
    }
}
