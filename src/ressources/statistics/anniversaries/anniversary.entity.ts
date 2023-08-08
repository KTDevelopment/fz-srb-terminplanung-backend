import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Type} from "class-transformer";
import {IsInt, IsOptional} from "class-validator";
import {Member} from "../../members/member.entity";
import {StatisticsEntry} from "../statisticsEntry/statisticsEntry.entity";
import {BaseEntity} from "../../../_common/base.entity";

@Entity()
export class Anniversary extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    anniversaryId: number;

    @Column()
    @IsInt()
    performanceCount: number;

    @Column()
    @IsInt()
    statisticsEntryId: number;

    @Column()
    @IsInt()
    memberId: number;

    @ManyToOne(() => Member, member => member.memberId)
    @JoinColumn({name: "memberId"})
    @Type(() => Member)
    member: Member;

    @ManyToOne(() => StatisticsEntry, statisticsEntry => statisticsEntry.id)
    @JoinColumn({name: "statisticsEntryId"})
    @Type(() => StatisticsEntry)
    statisticsEntry: StatisticsEntry;
}
