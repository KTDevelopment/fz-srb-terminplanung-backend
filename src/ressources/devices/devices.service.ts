import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Device} from "./device.entity";
import {CustomCrudService} from "../../_common/CustomCrudService";
import {DeepPartial, In} from "typeorm";
import {CrudRequest} from "@nestjsx/crud";

@Injectable()
export class DevicesService extends CustomCrudService<Device> {
    constructor(@InjectRepository(Device) repo) {
        super(repo);
    }

    async createOne(req: CrudRequest, dto: DeepPartial<Device>): Promise<Device> {
        const memberId = req.parsed.authPersist.memberId || dto.memberId;
        const candidate = await this.findOne({where: {registrationId: dto.registrationId, memberId}});
        if (candidate) {
            return candidate
        }
        return super.createOne(req, dto);
    }

    async deleteDevices(registrationIds: string[]) {
        return await this.repo.delete({registrationId: In(registrationIds)})
    }
}
