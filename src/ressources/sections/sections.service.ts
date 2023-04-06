import {Injectable} from '@nestjs/common';
import {Section} from "./section.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {plainToClass} from "class-transformer";
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
            plainToClass(Section, {sectionId: 1, sectionName: 'Hochtrommler'}),
            plainToClass(Section, {sectionId: 2, sectionName: 'Marschtrommler'}),
            plainToClass(Section, {sectionId: 3, sectionName: '1.Stimme'}),
            plainToClass(Section, {sectionId: 4, sectionName: '2.Stimme'}),
            plainToClass(Section, {sectionId: 5, sectionName: '3.Stimme'}),
            plainToClass(Section, {sectionId: 6, sectionName: '4.Stimme'}),
        ]
    }
}
