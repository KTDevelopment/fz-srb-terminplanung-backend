import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {IsDate, IsInt, IsOptional, IsString} from "class-validator";
import {BaseEntity} from "../../../_common/base.entity";

@Entity()
@Unique(["name", "eventId", "sectionId"])
export class StatisticsEntry extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    id: number;

    @Column()
    @IsString()
    name: string;

    @Column()
    @IsString()
    locationString: string;

    @Column({type: "datetime"})
    @IsDate()
    date: Date;

    @Column()
    @IsInt()
    eventId: number;

    @Column()
    @IsInt()
    sectionId: number;

    @Column({
        type: "tinyint",
        transformer: {
            from(value: number): boolean {
                return !!value;
            },
            to(value: boolean) {
                return (value) ? 1 : 0;
            }
        }
    })
    isProcessed: boolean;

    isNotInPast(): boolean {
        return new Date().getTime() < this.date.getTime();
    }
}
