import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {plainToInstance} from "class-transformer";
import {Role, ROLE_ID_ADMIN, ROLE_ID_MEMBER, ROLE_ID_NEWS_MAN, ROLE_ID_PLANNER, ROLE_ID_WEBADMIN} from "./role.entity";
import {CustomCrudService} from "../../_common/CustomCrudService";

export const DEFAULT_MEMBER_ROLE_ID = 200;

@Injectable()
export class RolesService extends CustomCrudService<Role> {
    constructor(@InjectRepository(Role) repo) {
        super(repo);
    }

    async getDefaultRole(): Promise<Role> {
        return this.repo.findOneBy({roleId: DEFAULT_MEMBER_ROLE_ID});
    }

    async insertDefaultRolesNeeded() {
        await Promise.all(RolesService.defaultRoles().map(async (role) => {
            if ((await this.repo.countBy({roleId: role.roleId})) === 0) {
                await this.repo.insert(role)
            }
        }));
    }

    private static defaultRoles() {
        return [
            plainToInstance(Role, {roleId: ROLE_ID_ADMIN, roleName: 'admin'}),
            plainToInstance(Role, {roleId: ROLE_ID_WEBADMIN, roleName: 'webadmin'}),
            plainToInstance(Role, {roleId: ROLE_ID_NEWS_MAN, roleName: 'newsMan'}),
            plainToInstance(Role, {roleId: ROLE_ID_PLANNER, roleName: 'planner'}),
            plainToInstance(Role, {roleId: ROLE_ID_MEMBER, roleName: 'member'}),
        ]
    }
}
