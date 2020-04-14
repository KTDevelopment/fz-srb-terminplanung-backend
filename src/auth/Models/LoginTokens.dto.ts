import {IsString} from "class-validator";

export class LoginTokensDto {
    @IsString()
    accessToken: string;
    @IsString()
    refreshToken: string;
}
