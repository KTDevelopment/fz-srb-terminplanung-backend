import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IsInt, IsOptional, IsString} from "class-validator";
import {Member} from "../members/member.entity";
import {BaseEntity} from "../../_common/base.entity";

@Entity()
export class Device extends BaseEntity {

    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    deviceId: number;

    @Column()
    @IsString()
    registrationId: string;

    @ManyToOne(() => Member, member => member.devices)
    @JoinColumn({name: 'memberId'})
    member: Member;

    @Column()
    @IsInt()
    memberId: number;

    @Column()
    @IsString()
    deviceType: AVAILABLE_DEVICE_TYPES;
}

export const DEVICE_TYPE_IOS = 'type_ios';
export const DEVICE_TYPE_ANDROID = 'type_android';
export const DEVICE_TYPE_UNKNOWN = 'type_unknown';
export type AVAILABLE_DEVICE_TYPES = typeof DEVICE_TYPE_ANDROID | typeof DEVICE_TYPE_IOS | typeof DEVICE_TYPE_UNKNOWN;
