import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeCharsetOfDescriptionOnEvent1691332439688 implements MigrationInterface {
    name = 'ChangeCharsetOfDescriptionOnEvent1691332439688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`event\`
                MODIFY \`description\`
                    TEXT
                        CHARACTER SET utf8mb4
                            COLLATE utf8mb4_unicode_ci
                    NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event\`
                MODIFY \`summary\`
                    TEXT
                        CHARACTER SET utf8mb4
                            COLLATE utf8mb4_unicode_ci
                    NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event\`
                MODIFY \`eventName\`
                    VARCHAR(255)
                        CHARACTER SET utf8mb4
                            COLLATE utf8mb4_unicode_ci
                    NOT NULL
        `);
    }

    public async down(_: QueryRunner): Promise<void> {
        throw new Error('there is no way back')
    }

}
