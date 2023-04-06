import {TransformFnParams} from "class-transformer/types/interfaces";
import {TransformationType} from "class-transformer";

export const rolesTransformer: (params: TransformFnParams) => any = (params) => {
    switch (params.type) {
        case TransformationType.PLAIN_TO_CLASS:
            return params.value;
        case TransformationType.CLASS_TO_PLAIN:
            return params.value.map(role => {
                delete role.creationDate;
                delete role.updateDate;
                delete role.version;
                return role;
            });
        default:
            return undefined;
    }
}
