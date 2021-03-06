import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class DropBoxLinksDto {

    @ApiProperty()
    @IsString()
    main: string;

    @ApiProperty()
    @IsString()
    music: string;

    @ApiProperty()
    @IsString()
    drill: string;
}
