import {forwardRef, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {PassportModule} from "@nestjs/passport";
import {LocalStrategy} from "./strategies/local.strategy";
import {MembersModule} from "../ressources/members/members.module";
import {AccessTokenStrategy} from "./strategies/access-token-strategy.service";
import {PasswordEncryptor} from "./password.encryptor";
import {AuthController} from './auth.controller';
import {RefreshTokenStrategy} from "./strategies/refresh-token.strategy";
import {TokenService} from "./token.service";
import {MailModule} from "../mail/mail.module";
import {BasicAuthorizer} from "./basic.authorizer";

@Module({
    imports: [
        forwardRef(() => MembersModule),
        PassportModule.register({}),
        MailModule
    ],
    providers: [
        AuthService,
        PasswordEncryptor,
        TokenService,
        LocalStrategy,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        BasicAuthorizer
    ],
    exports: [
        AuthService,
        PasswordEncryptor,
        BasicAuthorizer
    ],
    controllers: [AuthController]
})
export class AuthModule {
}
