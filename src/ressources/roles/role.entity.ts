import {Column, Entity, ManyToMany, PrimaryColumn} from "typeorm";
import {IsInt, IsString} from "class-validator";
import {Member} from "../members/member.entity";
import {BaseEntity} from "../../_common/base.entity";

@Entity()
export class Role extends BaseEntity {

    @PrimaryColumn()
    @IsInt()
    roleId: number;

    @Column()
    @IsString()
    roleName: string;

    @ManyToMany(() => Member, member => member.roles)
    members: Member[];
}

export const ROLE_ID_MEMBER = 200;
export const ROLE_ID_ADMIN = 0;
export const ROLE_ID_PLANNER = 100;
export const ROLE_ID_WEBADMIN = 1;
export const ROLE_ID_NEWS_MAN = 25;
