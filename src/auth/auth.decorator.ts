import {applyDecorators, UseGuards} from '@nestjs/common';
import {Roles} from "../ressources/roles/roles.decorator";
import {DefaultAuthGuard} from "./auth.service";
import {RolesGuard} from "../ressources/roles/roles.guard";
import {ApiBearerAuth, ApiUnauthorizedResponse} from "@nestjs/swagger";

export function Auth(...roles: number[]) {
    return applyDecorators(
        Roles(...roles),
        UseGuards(DefaultAuthGuard, RolesGuard),
        ApiUnauthorizedResponse({ description: 'Unauthorized"' }),
        ApiBearerAuth()
    );
}
