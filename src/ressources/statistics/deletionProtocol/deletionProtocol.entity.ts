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
    //TODO fix this to the name of the member, because a deletion of the statisticsEntry should generate protocol entries

    @Column()
    @IsInt()
    statisticsEntryId: number;
    //TODO fix this to the name of the statisticsEntry, because a deletion of the statisticsEntry should generate protocol entries

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
