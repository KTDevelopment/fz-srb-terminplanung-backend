import {Injectable} from "@nestjs/common";
import {Member} from "../ressources/members/member.entity";
import bcrypt = require('bcrypt');

@Injectable()
export class PasswordEncryptor {

    hashPassword(password): string {
        return bcrypt.hashSync(password, 10);
    };

    verifyPassword(password: string, member: Member) {
        return bcrypt.compareSync(password, member.password);
    };
}
