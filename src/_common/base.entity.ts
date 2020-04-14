import {ApiProperty} from "@nestjs/swagger";
import {CreateDateColumn, UpdateDateColumn, VersionColumn} from "typeorm";
import {IsOptional} from "class-validator";

export class BaseEntity {
    @ApiProperty({readOnly: true})
    @IsOptional()
    @CreateDateColumn({readonly: true})
    creationDate: Date;

    @ApiProperty({readOnly: true})
    @IsOptional()
    @UpdateDateColumn({readonly: true})
    updateDate: Date;

    @ApiProperty({readOnly: true})
    @IsOptional()
    @VersionColumn({readonly: true})
    version: number;
}
