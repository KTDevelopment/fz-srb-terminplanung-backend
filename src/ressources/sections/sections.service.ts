import {Injectable} from '@nestjs/common';
import {Section} from "./section.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {plainToInstance} from "class-transformer";
import {CustomCrudService} from "../../_common/CustomCrudService";

@Injectable()
export class SectionsService extends CustomCrudService<Section> {
    constructor(@InjectRepository(Section) repo) {
        super(repo);
    }

    async insertDefaultSectionsIdNeeded() {
        await Promise.all(SectionsService.defaultSections().map(async (section) => {
            if ((await this.repo.countBy({sectionId: section.sectionId})) === 0) {
                await this.repo.insert(section)
            }
        }));
    }

    private static defaultSections() {
        return [
            plainToInstance(Section, {sectionId: 1, sectionName: 'Hochtrommler'}),
            plainToInstance(Section, {sectionId: 2, sectionName: 'Marschtrommler'}),
            plainToInstance(Section, {sectionId: 3, sectionName: '1.Stimme'}),
            plainToInstance(Section, {sectionId: 4, sectionName: '2.Stimme'}),
            plainToInstance(Section, {sectionId: 5, sectionName: '3.Stimme'}),
            plainToInstance(Section, {sectionId: 6, sectionName: '4.Stimme'}),
        ]
    }
}
