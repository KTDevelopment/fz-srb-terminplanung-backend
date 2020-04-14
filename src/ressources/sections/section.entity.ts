import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {IsInt, IsString} from "class-validator";
import {Member} from "../members/member.entity";
import {BaseEntity} from "../../_common/base.entity";

@Entity()
export class Section extends BaseEntity {

    @PrimaryColumn()
    @IsInt()
    sectionId: number;

    @Column()
    @IsString()
    sectionName: string;

    @OneToMany(() => Member, member => member.section)
    members: Member[];
}
