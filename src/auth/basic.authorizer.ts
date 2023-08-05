import {Injectable} from "@nestjs/common";
import {AsyncAuthorizerCallback} from "express-basic-auth";
import {AuthService} from "./auth.service";

@Injectable()
export class BasicAuthorizer {

    constructor(private readonly authService: AuthService) {
    }

    authorize(username: string, password: string, callback: AsyncAuthorizerCallback) {
        this.authService.validateMember(username, password)
            .then(member => callback(null, !!member))
            .catch(() => callback(null, false));
    }
}
