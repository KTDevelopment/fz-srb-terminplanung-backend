import {validate} from "class-validator";
import {BadRequestException} from "@nestjs/common";

export async function validateEntity<T>(entity: T):Promise<T> {
    const errors = await validate(entity);
    if (errors.length > 0) {
        throw new BadRequestException('invalidEntity:' + JSON.stringify(entity) + '   ' + JSON.stringify(errors));
    }
    return entity;
}
