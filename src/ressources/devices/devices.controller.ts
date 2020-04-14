import {Controller} from '@nestjs/common';
import {Crud, CrudAuth, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {Device} from "./device.entity";
import {DevicesService} from "./devices.service";
import {ROLE_ID_ADMIN, ROLE_ID_MEMBER} from "../roles/role.entity";
import {Auth} from "../../auth/auth.decorator";
import {Roles} from "../roles/roles.decorator";

@Auth(ROLE_ID_ADMIN)
@Crud({
    model: {
        type: Device
    },
    params: {
        deviceId: {
            field: 'deviceId',
            type: 'number',
            primary: true,
        },
    },
    query: {
        join: {
            member: {
                //@ts-ignore
                condition: 'isDeleted = 0'
            }
        }
    },
    routes: {
        exclude: ["createManyBase"],
        getManyBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        createOneBase: {
            returnShallow: true,
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        updateOneBase: {
            returnShallow: true,
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        replaceOneBase: {
            returnShallow: true,
            decorators: [Roles(ROLE_ID_MEMBER)]
        },
        deleteOneBase: {
            decorators: [Roles(ROLE_ID_MEMBER)]
        }
    }
})
@CrudAuth({
    filter: req => {
        const member = req.user;
        if (member.isNotPrivileged()) {
            return {memberId: member.memberId}
        }
    },
    persist: req => {
        const member = req.user;
        if (member.isNotPrivileged()) {
            return {memberId: member.memberId}
        }
        if (!req.body.memberId) {
            return {memberId: member.memberId}
        }
    }
})
@ApiTags('devices')
@Controller('api/v2/devices')
export class DevicesController implements CrudController<Device> {
    constructor(public service: DevicesService) {
    }
}
