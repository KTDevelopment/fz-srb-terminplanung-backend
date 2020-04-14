import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IsInt, IsOptional} from "class-validator";
import {Type} from "class-transformer";
import {Member} from "../members/member.entity";
import {Event} from "../events/event.entity";
import {ParticipationState} from "./participation-states/participation-state.entity";
import {BaseEntity} from "../../_common/base.entity";

@Entity()
export class Participation extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    id: number;

    @Column()
    @IsInt()
    memberId: number;

    @Column()
    @IsInt()
    eventId: number;

    @Column({default: 0})
    @IsInt()
    stateId: number;

    @ManyToOne(() => Member, member => member.memberId, {eager: true})
    @JoinColumn({name: "memberId"})
    @Type(() => Member)
    member: Member;

    @ManyToOne(() => Event, event => event.eventId, {onDelete: 'CASCADE'})
    @JoinColumn({name: "eventId"})
    event: Event;

    @ManyToOne(() => ParticipationState, participationState => participationState.stateId)
    @JoinColumn({name: "stateId"})
    participationState: ParticipationState;

    hasState(stateId: number): boolean {
        return this.stateId === stateId;
    }
}
