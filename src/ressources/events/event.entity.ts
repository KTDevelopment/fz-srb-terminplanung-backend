import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsDate, IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import {BaseEntity} from "../../_common/base.entity";

@Entity()
export class Event extends BaseEntity {

    @PrimaryGeneratedColumn({type: "int"})
    @IsInt()
    @IsOptional()
    eventId: number;

    @IsString()
    @Column({type: "varchar", length: 255, nullable: true})
    remoteId: string;

    @Column({type: "datetime"})
    @IsDate()
    startDate: Date;

    @Column({type: "datetime"})
    @IsDate()
    endDate: Date;

    @Column({type: "text"})
    @IsString()
    summary: string;

    @Column({type: "text"})
    @IsString()
    description: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    eventName: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    location: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    address: string;

    @Column({type: 'int'})
    @IsInt()
    postcode: number;

    @Column({type: "varchar", length: 255})
    @IsString()
    town: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    dress: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    participatingGroup: string;

    @Column({type: "varchar", length: 255})
    @IsString()
    category: string;

    @Column({type: "double"})
    @IsNumber()
    longitude: number;

    @Column({type: "double"})
    @IsNumber()
    latitude: number;

    @Column({
        type: "tinyint",
        transformer: {
            from(value: 'tinyint'): boolean {
                return !!value;
            },
            to(value: boolean) {
                return (value) ? 1 : 0;
            }
        }
    })
    @IsOptional()
    isPublic: boolean;

    isInPast() {
        let now = new Date();
        return now.getTime() > this.endDate.getTime();
    }

    equalsEventWithoutCoordinates(event: Event): boolean {
        return (
            this.startDate.getTime() === event.startDate.getTime() &&
            this.endDate.getTime() === event.endDate.getTime() &&
            this.summary === event.summary &&
            this.description === event.description &&
            this.eventName === event.eventName &&
            this.location === event.location &&
            this.address === event.address &&
            this.postcode === event.postcode &&
            this.town === event.town &&
            this.dress === event.dress &&
            this.participatingGroup === event.participatingGroup &&
            this.category === event.category
        );
    }

    locationInfosEquals(event: Event): boolean {
        return (
            this.location === event.location &&
            this.address === event.address &&
            this.postcode === event.postcode &&
            this.town === event.town
        );
    }
}
