import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Member} from "./member.entity";
import {PasswordEncryptor} from "../../auth/password.encryptor";
import {CreateManyDto, CrudRequest} from "@nestjsx/crud";
import {validateEntity} from "../../_common/EntityValidator";
import {RolesService} from "../roles/roles.service";
import {Role} from "../roles/role.entity";
import {DeepPartial} from "typeorm";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {CustomCrudService} from "../../_common/CustomCrudService";

@Injectable()
export class MembersService extends CustomCrudService<Member> {
    constructor(
        @InjectRepository(Member) repo,
        private readonly passwordEncryptor: PasswordEncryptor,
        private readonly roleService: RolesService) {
        super(repo);
    }

    async findPlannerOfMember(member: Member) {
        const memberOfSection = await this.repo.find({
            where: {sectionId: member.sectionId},
            relations: ['section', 'devices']
        });
        return memberOfSection.filter(member => member.isPlanner());
    }

    async save(member: Member) {
        return this.repo.save(member);
    }

    async findDetailedMember(memberIdOrEmail: number | string): Promise<Member> {
        const findCondition: FindOneOptions = {
            relations: ['section', 'devices']
        };

        if (typeof memberIdOrEmail === 'number') {
            findCondition.where = {memberId: memberIdOrEmail}
        } else {
            findCondition.where = {email: memberIdOrEmail}
        }

        return this.repo.findOneOrFail(findCondition)
    }

    async createOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        const baseMember = this.repo.create(dto)
        const defaultRole = await this.roleService.getDefaultRole()
        await this.ensureUniqueName(baseMember);
        return await this.repo.save(
            await validateEntity(
                this.augmentMemberWithMandatoryRolesAndHashedPassword(baseMember, defaultRole)
            )
        );
    }

    async createMany(req: CrudRequest, dto: CreateManyDto<DeepPartial<Member>>): Promise<Member[]> {
        const newMembers = this.repo.create(dto.bulk);
        await this.ensureUniqueNames(newMembers);
        const defaultRole = await this.roleService.getDefaultRole();
        const membersToSave = newMembers.map(it => this.augmentMemberWithMandatoryRolesAndHashedPassword(it, defaultRole));

        await Promise.all(membersToSave.map(newMember => validateEntity(newMember)));
        return await this.repo.save(membersToSave);
    }

    async updateOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        return this.upDateOrReplace(req, dto)
    }

    async replaceOne(req: CrudRequest, dto: DeepPartial<Member>): Promise<Member> {
        return this.upDateOrReplace(req, dto)
    }

    async deleteOne(req: CrudRequest): Promise<undefined | Member> {
        const found = await this.getOneOrFail(req, true);
        found.isDeleted = true;
        await this.repo.save((found));

        return found;
    }

    async insertKevinThuermann() {
        if ((await this.repo.count({where: {firstName: 'Kevin', lastName: 'Thürmann'}})) === 0) {
            await this.repo.save(this.getKevin());
        }
    }

    private async upDateOrReplace(req: CrudRequest, dto: DeepPartial<Member>) {
        const found = await this.getOneOrFail(req);
        delete dto.memberId;
        this.hashPasswordOfMember(dto);
        const toSave = this.repo.create({...found, ...dto});
        if (found.getFullName() !== toSave.getFullName()) {
            await this.ensureUniqueName(toSave);
        }
        MembersService.augmentRolesOfMember(toSave, await this.roleService.getDefaultRole());
        await this.repo.save(toSave);
        return this.findDetailedMember(toSave.memberId);
    }

    private augmentMemberWithMandatoryRolesAndHashedPassword(baseMember: Member, defaultRole: Role): Member {
        if (!baseMember.roles) baseMember.roles = [];
        MembersService.augmentRolesOfMember(baseMember, defaultRole);
        if (!baseMember.password) baseMember.password = "";
        this.hashPasswordOfMember(baseMember);
        return baseMember;
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
            password: this.passwordEncryptor.hashPassword('test'),
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

    private async ensureUniqueName(member: Member) {
        const loadedMember = await this.repo.findOneBy({firstName: member.firstName, lastName: member.lastName})
        if (loadedMember) {
           throw new BadRequestException("combination of firstName and lastName already taken")
        }
    }

    private async ensureUniqueNames(member: Member[]) {
        const loadedMembers = await this.repo.findBy(member.map(it => ({firstName: it.firstName, lastName: it.lastName})))
        if (loadedMembers.length > 0) {
            throw new BadRequestException("combination of firstName and lastName already taken")
        }
    }
}
