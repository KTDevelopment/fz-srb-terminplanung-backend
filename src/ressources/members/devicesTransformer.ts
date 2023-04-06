import {TransformFnParams} from "class-transformer/types/interfaces";
import {TransformationType} from "class-transformer";

export const devicesTransformer: (params: TransformFnParams) => any = (params) => {
    switch (params.type) {
        case TransformationType.PLAIN_TO_CLASS:
            return params.value;
        case TransformationType.CLASS_TO_PLAIN:
            return typeof params.value === "boolean" ? params.value : params.value.length > 0; // can be boolean if classToPlain gets called multiple times
        default:
            return undefined;
    }
}
