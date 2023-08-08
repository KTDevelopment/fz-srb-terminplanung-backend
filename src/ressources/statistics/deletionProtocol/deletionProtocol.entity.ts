import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsInt, IsOptional, IsString} from "class-validator";
import {BaseEntity} from "../../../_common/base.entity";

@Entity({name: "statistics_deletion_protocol"})
export class DeletionProtocol extends BaseEntity {

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

    @Column()
    @IsInt()
    deletingMemeberId: number;

    @Column()
    @IsString()
    deletingMemeberName: string;
}
