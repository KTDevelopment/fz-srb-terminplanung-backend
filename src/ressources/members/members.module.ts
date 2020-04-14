import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MembersController} from "./members.controller";
import {MembersService} from "./members.service";
import {Member} from "./member.entity";
import {AuthModule} from "../../auth/auth.module";
import {RolesModule} from "../roles/roles.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Member]),
        forwardRef(() => AuthModule),
        RolesModule
    ],
    controllers: [MembersController],
    providers: [MembersService],
    exports: [MembersService],
})
export class MembersModule {
}
