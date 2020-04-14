import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Member} from "../../ressources/members/member.entity";
import {MembersService} from "../../ressources/members/members.service";
import {ConfigService} from "../../config/config.service";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'accessToken') {
    constructor(
        private readonly configService: ConfigService,
        private readonly memberService: MembersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.config.auth.accessSecret,
        });
    }

    async validate(payload: any): Promise<Member> {
        try {
            return await this.memberService.findDetailedMember(payload.sub);
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}
