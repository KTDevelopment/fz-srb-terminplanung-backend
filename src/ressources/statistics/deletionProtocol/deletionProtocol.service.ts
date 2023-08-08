import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DeletionProtocol} from "./deletionProtocol.entity";
import {Repository} from "typeorm";
import {CustomCrudService} from "../../../_common/CustomCrudService";

@Injectable()
export class DeletionProtocolService extends CustomCrudService<DeletionProtocol> {
    constructor(@InjectRepository(DeletionProtocol) repo: Repository<DeletionProtocol>) {
        super(repo);
    }
}
