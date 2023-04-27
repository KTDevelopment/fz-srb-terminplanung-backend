import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {SelectQueryBuilder} from "typeorm";
import {QueryOptions} from "@nestjsx/crud";
import {ParsedRequestParams} from '@nestjsx/crud-request';

export abstract class CustomCrudService<T> extends TypeOrmCrudService<T> {

    protected setJoin(
        cond: any,
        joinOptions: any,
        builder: SelectQueryBuilder<T>,
    ) {
        const options = joinOptions[cond.field];

        if (!options) {
            return true;
        }

        const allowedRelation = this.getRelationMetadata(cond.field, options);

        if (!allowedRelation) {
            return true;
        }

        const relationType = options.required ? 'innerJoin' : 'leftJoin';
        const alias = options.alias ? options.alias : allowedRelation.name;
        const relationCondition = options.condition || '';

        builder[relationType](allowedRelation.path, alias, relationCondition);

        if (options.select !== false) {
            const columns = isArrayFull(cond.select)
                ? cond.select.filter((column) =>
                    allowedRelation.allowedColumns.some((allowed) => allowed === column),
                )
                : allowedRelation.allowedColumns;

            const select = [
                ...allowedRelation.primaryColumns,
                ...(isArrayFull(options.persist) ? options.persist : []),
                ...columns,
            ].map((col) => `${alias}.${col}`);

            builder.addSelect(Array.from(new Set(select)));
        }
    }

    protected getSelect(query: ParsedRequestParams, options: QueryOptions): string[] {
        const allowed = this.getAllowedColumns(this.entityColumns, options);

        const columns =
            query.fields && query.fields.length
                ? query.fields.filter((field) => allowed.some((col) => field === col))
                : allowed;

        const select = [
            ...(options.persist && options.persist.length ? options.persist : []),
            ...columns,
            ...this.entityPrimaryColumns,
        ].map((col) => `${this.alias}.${col}`);

        return Array.from(new Set(select));
    }
}

const isArrayFull = (val: any): boolean => Array.isArray(val) && hasLength(val);
const hasLength = (val: any): boolean => val.length > 0;
