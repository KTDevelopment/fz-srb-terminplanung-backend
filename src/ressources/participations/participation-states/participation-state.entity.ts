import {Column, Entity, PrimaryColumn} from "typeorm";
import {IsInt, IsString} from "class-validator";
import {BaseEntity} from "../../../_common/base.entity";

@Entity()
export class ParticipationState extends BaseEntity {

    @PrimaryColumn()
    @IsInt()
    stateId: number;

    @Column()
    @IsString()
    stateName: string;

    isState(stateId: number): boolean {
        return this.stateId === stateId;
    }
}

export const STATE__NOT_INVITED = 0;
export const STATE__INVITED = 1;
export const STATE__ATTEND = 2;
export const STATE__DO_NOT_ATTEND = 3;
export const STATE__INVITATION_REQUEST_PENDING = 4;
export const STATE__INVITATION_REQUEST_REJECTED = 5;
export const STATE_DEPRECATIONS = {
    STATE__HAS_PARTICIPATED: 6,
    STATE__HAS_NOT_PARTICIPATED: 7,
}
