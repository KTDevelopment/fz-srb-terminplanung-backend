import {Injectable} from '@nestjs/common';
import {CustomCrudService} from "../../_common/CustomCrudService";
import {InjectRepository} from "@nestjs/typeorm";
import {Anniversary} from "./anniversary.entity";

@Injectable()
export class AnniversariesService extends CustomCrudService<Anniversary> {
    constructor(@InjectRepository(Anniversary) repo) {
        super(repo);
    }
}
