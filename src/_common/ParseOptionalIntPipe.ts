import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform<string | undefined, number | undefined> {
    transform(value: string | undefined, metadata: ArgumentMetadata): number | undefined {
        if (value == undefined) return undefined;
        return parseInt(value)
    }
}
