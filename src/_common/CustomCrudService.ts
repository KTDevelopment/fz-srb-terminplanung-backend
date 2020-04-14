import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {SelectQueryBuilder} from "typeorm";

export abstract class CustomCrudService<T> extends TypeOrmCrudService<T> {

    protected setJoin(
        cond: any,
        joinOptions: any,
        builder: SelectQueryBuilder<T>,
    ) {
        if (this.entityRelationsHash[cond.field] === undefined && cond.field.includes('.')) {
            const curr = this.getRelationMetadata(cond.field);
            if (!curr) {
                this.entityRelationsHash[cond.field] = null;
                return true;
            }

            this.entityRelationsHash[cond.field] = {
                name: curr.propertyName,
                columns: curr.inverseEntityMetadata.columns.map((col) => col.propertyName),
                primaryColumns: curr.inverseEntityMetadata.primaryColumns.map(
                    (col) => col.propertyName,
                ),
                nestedRelation: curr.nestedRelation,
            };
        }

        /* istanbul ignore else */
        if (cond.field && this.entityRelationsHash[cond.field] && joinOptions[cond.field]) {
            const relationCondition = joinOptions[cond.field].condition || '';
            const relation = this.entityRelationsHash[cond.field];
            const options = joinOptions[cond.field];
            const allowed = this.getAllowedColumns(relation.columns, options);

            /* istanbul ignore if */
            if (!allowed.length) {
                return true;
            }

            const alias = options.alias ? options.alias : relation.name;

            const columns =
                !cond.select || !cond.select.length
                    ? allowed
                    : cond.select.filter((col) => allowed.some((a) => a === col));

            const select = [
                ...relation.primaryColumns,
                ...(options.persist && options.persist.length ? options.persist : []),
                ...columns,
            ].map((col) => `${alias}.${col}`);

            const relationPath = relation.nestedRelation || `${this.alias}.${relation.name}`;
            const relationType = options.required ? 'innerJoin' : 'leftJoin';

            builder[relationType](relationPath, alias, relationCondition);
            builder.addSelect(select);
        }

        return true;
    }
}
