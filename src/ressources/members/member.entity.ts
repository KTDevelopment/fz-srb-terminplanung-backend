import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Exclude, Transform, TransformationType} from "class-transformer";
import {IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import {ApiHideProperty, ApiProperty} from "@nestjs/swagger";
import {Role, ROLE_ID_ADMIN, ROLE_ID_NEWS_MAN, ROLE_ID_PLANNER} from "../roles/role.entity";
import {Device} from "../devices/device.entity";
import {Section} from "../sections/section.entity";
import {BaseEntity} from "../../_common/base.entity";

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

function devicesTransformer(value, object, transformationType){
    switch (transformationType) {
        case TransformationType.PLAIN_TO_CLASS:
            return value;
        case TransformationType.CLASS_TO_PLAIN:
            return typeof value === "boolean" ? value : value.length > 0; // can be boolean if classToPlain gets called multiple times
        default:
            return undefined;
    }
}


function rolesTransformer(value, object, transformationType){
    switch (transformationType) {
        case TransformationType.PLAIN_TO_CLASS:
            return value;
        case TransformationType.CLASS_TO_PLAIN:
            return value.map(role => {
                delete role.creationDate;
                delete role.updateDate;
                delete role.version;
                return role;
            });
        default:
            return undefined;
    }
}
