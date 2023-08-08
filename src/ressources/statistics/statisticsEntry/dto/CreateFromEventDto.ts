import {IsInt, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateFromEventDto {
    @IsInt()
    eventId: number;

    @IsNumber({}, {each: true})
    sectionIds: number[];

    @IsOptional()
    @IsString()
    customName?: string;
}
