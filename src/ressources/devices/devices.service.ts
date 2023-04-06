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

    async updateRegistrationIds(registrationIdPairs: RegistrationIdPair[]) {
        let oldIds = registrationIdPairs.map(pair => pair.old);
        let candidates = await this.repo.find({where: {registrationId: In(oldIds)}});
        candidates.map(candidate =>
            candidate.registrationId = registrationIdPairs.find(pair => pair.old === candidate.registrationId).new
        );
        return await this.repo.save(candidates);
    }
}

export interface RegistrationIdPair {
    old: string,
    new: string
}
