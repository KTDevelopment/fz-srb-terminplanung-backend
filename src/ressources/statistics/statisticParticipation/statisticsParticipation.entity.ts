import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IsInt, IsOptional} from "class-validator";
import {BaseEntity} from "../../../_common/base.entity";
import {Member} from "../../members/member.entity";
import {Type} from "class-transformer";
import {StatisticsEntry} from "../statisticsEntry/statisticsEntry.entity";

@Entity()
export class StatisticsParticipation extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    id: number;

    @Column()
    @IsInt()
    memberId: number;

    @Column()
    @IsInt()
    statisticsEntryId: number;

    @Column()
    @IsInt()
    performanceCount: number;

    decreasePerformanceCount() {
        this.performanceCount -= 1;

        return this;
    }

    @ManyToOne(() => Member, member => member.memberId, {eager: true})
    @JoinColumn({name: "memberId"})
    @Type(() => Member)
    member: Member;

    @ManyToOne(() => StatisticsEntry, statisticsEntry => statisticsEntry.id, {onDelete: 'CASCADE'})
    @JoinColumn({name: "statisticsEntryId"})
    statisticsEntry: StatisticsEntry;
}
