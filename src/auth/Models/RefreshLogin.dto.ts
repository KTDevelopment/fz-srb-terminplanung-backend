import {IsString} from "class-validator";

export class RefreshLoginDto {
    @IsString()
    refreshToken: string;
}
