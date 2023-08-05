import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from "@nestjs/core";
import {Member} from "../members/member.entity";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.getRoles(context);
        if (roles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const member = request.user as Member;
        return member && roles.some(role => member.hasRole(role));
    }

    private getRoles(context: ExecutionContext): number[] {
        const first = this.reflector.get<number[]>('roles', context.getClass()) || [];
        const second = this.reflector.get<number[]>('roles', context.getHandler()) || [];
        return [...first, ...second];
    }
}
