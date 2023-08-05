import {Injectable} from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import {AuthConfig} from "../config/config";
import {ConfigService} from "../config/config.service";

@Injectable()
export class TokenService {

    constructor(private readonly configService: ConfigService) {
    }

    getAccessToken(payload: object): string {
        return jwt.sign(payload, this.getAuthConfig().accessSecret, {expiresIn: this.getAuthConfig().accessTokenExpiresIn});
    }

    getRefreshToken(payload: object): string {
        return jwt.sign(payload, this.getAuthConfig().refreshSecret, {expiresIn: this.getAuthConfig().refreshTokenExpiresIn});
    }

    getPasswordResetToken(payload: object, secret: string) {
        return jwt.sign(payload, secret, {expiresIn: this.getAuthConfig().passwordResetTokenExpiresIn});
    }

    isPasswordResetTokenExpired(token: string, secret: string) {
        try {
            jwt.verify(token, secret)
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                return false
            } else {
                throw e;
            }
        }
    }

    private getAuthConfig(): AuthConfig {
        return this.configService.config.auth;
    }
}
