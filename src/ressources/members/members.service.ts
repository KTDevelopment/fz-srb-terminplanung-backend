import {Injectable} from '@nestjs/common';
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Member} from "./member.entity";
import {PasswordEncryptor} from "../../auth/password.encryptor";
import {CreateManyDto, CrudRequest} from "@nestjsx/crud";
import {validateEntity} from "../../_common/EntityValidator";
import {RolesService} from "../roles/roles.service";
import {Role} from "../roles/role.entity";
import {DeepPartial} from "typeorm";

@Injectable()
export class MembersService extends TypeOrmCrudService<Member> {
    constructor(
        @InjectRepository(Member) repo,
        private readonly passwordEncryptor: PasswordEncryptor,
        private readonly roleService: RolesService) {
        super(repo);
    }

    async findPlannerOfMember(member: Member) {
        const memberOfSection = await this.repo.find({where: {sectionId: member.sectionId}, relations: ['section', 'devices']});
        return memberOfSection.filter(member => member.isPlanner());
    }

    async save(member: Member) {
        return this.repo.save(member);
    }

    async findDetailedMember(memberIdOrEmail: number | string): Promise<Member> {
        let findCondition;

        if (typeof memberIdOrEmail === 'number') {
            findCondition = {memberId: memberIdOrEmail}
        } else {
            findCondition = {email: memberIdOrEmail}
        }

        return this.repo.findOneOrFail(findCondition, {relations: ['section', 'devices']})
    }

    async createOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        return await this.repo.save(
            await validateEntity(
                await this.createMemberWithMandatoryRolesAndHashedPassword(dto)
            )
        );
    }

    async createMany(req: CrudRequest, dto: CreateManyDto<DeepPartial<Member>>): Promise<Member[]> {
        let newMembers = this.repo.create(dto.bulk);
        let defaultMemberRole = await this.roleService.getDefaultRole();
        newMembers.forEach(newMember => {
            if (!newMember.roles) newMember.roles = [];
            MembersService.augmentRolesOfMember(newMember, defaultMemberRole);
            if (!newMember.password) newMember.password = "";
            this.hashPasswordOfMember(newMember);
        });

        await Promise.all(newMembers.map(newMember => validateEntity(newMember)));
        return await this.repo.save(newMembers);
    }

    async updateOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        const found = await this.getOneOrFail(req);
        this.hashPasswordOfMember(dto);
        const toSave = this.repo.create({...found, ...dto});
        MembersService.augmentRolesOfMember(toSave, await this.roleService.getDefaultRole());
        await this.repo.save(toSave);
        return this.findDetailedMember(toSave.memberId);
    }

    async replaceOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        const found = await this.getOneOrFail(req);
        this.hashPasswordOfMember(dto);
        const toSave = this.repo.create({...found, ...dto});
        MembersService.augmentRolesOfMember(toSave, await this.roleService.getDefaultRole());
        return await this.repo.save(toSave);
    }

    async deleteOne(req: CrudRequest): Promise<undefined | Member> {
        const found = await this.getOneOrFail(req, true);
        found.isDeleted = true;
        await this.repo.save((found));

        return found;
    }

    async insertKevinThuermann() {
        if ((await this.repo.count({firstName: 'Kevin', lastName: 'Thürmann'})) === 0) {
            await this.repo.save(this.getKevin());
        }
    }

    private async createMemberWithMandatoryRolesAndHashedPassword(memberLike: DeepPartial<Member>): Promise<Member> {
        let augmentedMember = this.repo.create(memberLike);
        if (!augmentedMember.roles) augmentedMember.roles = [];
        MembersService.augmentRolesOfMember(augmentedMember, await this.roleService.getDefaultRole());
        if (!augmentedMember.password) augmentedMember.password = "";
        this.hashPasswordOfMember(augmentedMember);
        return augmentedMember;
    }

    private static augmentRolesOfMember(newMember: Member, defaultMemberRole: Role) {
        if (newMember.roles) {
            if (!newMember.hasRole(defaultMemberRole)) {
                newMember.roles.push(defaultMemberRole)
            }
        }
    }

    private hashPasswordOfMember(newMember: DeepPartial<Member>) {
        if (newMember.password) {
            newMember.password = this.passwordEncryptor.hashPassword(newMember.password.toString());
        }
    }

    private getKevin() {
        return this.repo.create({
            memberId: 1,
            firstName: 'Kevin',
            lastName: 'Thürmann',
            performanceCount: 600,
            email: 'kevin.thuermann@web.de',
            password: this.passwordEncryptor.hashPassword('k8e4v6i2n'),
            isDeleted: false,
            devices: [{
                deviceId: 1,
            }],
            section: {
                sectionId: 2,
            },
            roles: [{
                roleId: 0,
            }, {
                roleId: 1,
            }, {
                roleId: 100,
            }, {
                roleId: 200,
            }]
        })
    }
}
