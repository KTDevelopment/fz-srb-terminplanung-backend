import {Controller} from '@nestjs/common';
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Auth} from "../../../auth/auth.decorator";
import {ROLE_ID_ADMIN} from "../../roles/role.entity";
import {DeletionProtocol} from "./deletionProtocol.entity";
import {DeletionProtocolService} from "./deletionProtocol.service";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: DeletionProtocol
    },
    query: {
        maxLimit: 100,
    },
    routes: {
        exclude: ["recoverOneBase", "deleteOneBase"],
    }
})
@ApiTags('statisticsDeletionProtocols')
@Controller('api/v2/statisticsDeletionProtocols')
export class DeletionProtocolController implements CrudController<DeletionProtocol> {
    constructor(public service: DeletionProtocolService) {
    }
}
