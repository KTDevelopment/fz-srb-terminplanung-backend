import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {AuthService} from "./auth.service";
import {ApiBody, ApiTags} from "@nestjs/swagger";
import {validateEntity} from "../_common/EntityValidator";
import {plainToClass} from "class-transformer";
import {LoginDto} from "./Models/Login.dto";
import {RefreshLoginDto} from "./Models/RefreshLogin.dto";
import {ResetPasswordDto} from "./Models/ResetPassword.dto";
import {DeepPartial} from "typeorm";

@ApiTags('auth')
@Controller('api/v2/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @ApiBody({type: LoginDto})
    @UseGuards(AuthGuard('local'))
    @Post('/login')
    async login(@Request() req) {
        return this.authService.generateLoginTokens(req.user);
    }

    @ApiBody({type: RefreshLoginDto})
    @UseGuards(AuthGuard('refreshToken'))
    @Post('/refresh')
    async refreshLogin(@Request() req) {
        return this.authService.generateLoginTokens(req.user);
    }

    @Get('/forgot-password/:email')
    public async sendPasswordResetEmail(@Param('email') email: string) {
        return this.authService.sendPasswordResetMail(email)
    }

    @ApiBody({type: ResetPasswordDto})
    @Post('/reset-password/:email')
    @HttpCode(HttpStatus.OK)
    public async setNewPassword(@Param('email') email: string, @Body() resetPasswordDtoLike: DeepPartial<ResetPasswordDto>) {
        const resetPasswordDto = await validateEntity(plainToClass(ResetPasswordDto, resetPasswordDtoLike));
        return this.authService.resetPassword(email, resetPasswordDto);
    }
}
