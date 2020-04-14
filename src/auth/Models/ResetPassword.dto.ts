import {IsString} from "class-validator";

export class ResetPasswordDto {
    @IsString()
    passwordResetToken: string;
    @IsString()
    newPassword: string;
}
