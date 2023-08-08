import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Anniversary} from "./anniversary.entity";
import {Repository} from "typeorm";
import {CustomCrudService} from "../../../_common/CustomCrudService";

@Injectable()
export class AnniversariesService extends CustomCrudService<Anniversary> {
    constructor(@InjectRepository(Anniversary) repo: Repository<Anniversary>) {
        super(repo);
    }
}
