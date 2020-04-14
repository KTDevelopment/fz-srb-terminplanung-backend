import {Injectable, UnauthorizedException} from '@nestjs/common';
import {MembersService} from "../ressources/members/members.service";
import {Member} from "../ressources/members/member.entity";
import {LoginTokensDto} from "./Models/LoginTokens.dto";
import {plainToClass} from "class-transformer";
import {PasswordEncryptor} from "./password.encryptor";
import {AuthGuard} from "@nestjs/passport";
import {TokenService} from "./token.service";
import {MailService} from "../mail/mail.service";
import {ResetPasswordDto} from "./Models/ResetPassword.dto";
import {ApplicationLogger} from "../logger/application-logger.service";

@Injectable()
export class AuthService {

    constructor(
        private readonly membersService: MembersService,
        private readonly tokenService: TokenService,
        private readonly passwordEncryptor: PasswordEncryptor,
        private readonly mailService: MailService,
        private readonly logger: ApplicationLogger
    ) {
        this.logger.setContext(AuthService.name)
    }

    async validateMember(email: string, password: string): Promise<Member | null> {
        try {
            const member = await this.membersService.findDetailedMember(email);
            if (this.passwordEncryptor.verifyPassword(password, member)) {
                return member;
            }
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    generateLoginTokens(member: Member): LoginTokensDto {
        let payload = {sub: member.memberId};

        return plainToClass(
            LoginTokensDto,
            {
                accessToken: this.tokenService.getAccessToken(payload),
                refreshToken: this.tokenService.getRefreshToken(payload)
            }
        );
    };

    async sendPasswordResetMail(email: string) {
        try {
            const member = await this.membersService.findDetailedMember(email);
            let passwordResetToken = this.tokenService.getPasswordResetToken({}, member.password);
            this.logger.log('passwordResetToken generated for: ' + email);
            await this.mailService.sendPasswordResetMail(member, passwordResetToken);
            return {send: true};
        } catch (e) {
            return null;
        }
    }

    async resetPassword(email: string, resetPasswordDto: ResetPasswordDto) {
        try {
            const member = await this.membersService.findDetailedMember(email);
            if (!this.tokenService.isPasswordResetTokenExpired(resetPasswordDto.passwordResetToken, member.password)) {
                member.password = this.passwordEncryptor.hashPassword(resetPasswordDto.newPassword);
                await this.membersService.save(member);
                return {changed: true};
            }
        } catch (e) {
            throw new UnauthorizedException('invalid token');
        }

        throw new UnauthorizedException('invalid token');
    }

}


export const DefaultAuthGuard = AuthGuard('accessToken');
