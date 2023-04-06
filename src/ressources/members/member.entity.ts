import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Exclude, Transform} from "class-transformer";
import {IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import {ApiHideProperty, ApiProperty} from "@nestjs/swagger";
import {Role, ROLE_ID_ADMIN, ROLE_ID_NEWS_MAN, ROLE_ID_PLANNER} from "../roles/role.entity";
import {Device} from "../devices/device.entity";
import {Section} from "../sections/section.entity";
import {BaseEntity} from "../../_common/base.entity";
import {rolesTransformer} from "./rolesTransformer";
import {devicesTransformer} from "./devicesTransformer";

@Entity()
export class Member extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsNumber()
    @IsOptional()
    memberId: number;

    @Column()
    @IsString()
    firstName: string;

    @Column()
    @IsString()
    lastName: string;

    @ManyToOne(() => Section, section => section.members)
    @JoinColumn({name: "sectionId"})
    @ValidateNested()
    section: Section;

    @Column()
    @IsInt()
    sectionId: number;

    @Column()
    @IsInt()
    performanceCount: number;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    @Exclude({toPlainOnly: true})
    @IsString()
    @IsOptional()
    @ApiHideProperty()
    password: string;

    @ManyToMany(() => Role, role => role.members, {eager:true})
    @JoinTable()
    @ValidateNested()
    @Transform(rolesTransformer)
    roles: Role[];

    @ApiProperty({type: 'boolean'})
    @OneToMany(() => Device, device => device.member)
    @Transform(devicesTransformer)
    devices: Device[];

    @Column({default: 0})
    @IsBoolean()
    @IsOptional()
    isDeleted: boolean;

    hasRole(roleToTest: Role): boolean;
    hasRole<T>(roleId: number): boolean;
    hasRole<T>(roleOrId: Role | number): boolean {
        if (typeof roleOrId === 'number') {
            return this.roles && this.roles.some(role => role.roleId === roleOrId);
        } else {
            return this.roles && this.roles.some(role => role.roleId === roleOrId.roleId);
        }
    }

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    isAdmin() {
        return this.hasRole(ROLE_ID_ADMIN);
    }

    isNewsman() {
        return this.hasRole(ROLE_ID_NEWS_MAN);
    }

    isPlanner() {
        return this.hasRole(ROLE_ID_PLANNER);
    }

    isPrivileged() {
        return this.isPlanner() || this.isAdmin();
    }

    isNotPrivileged() {
        return !this.isAdmin() && !this.isPlanner();
    }

    increasePerformanceCount() {
        this.performanceCount += 1;

        return this;
    }

    decreasePerformanceCount() {
        this.performanceCount -= 1;

        return this;
    }
}


