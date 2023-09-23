import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDatesAndVersionToAnniversaries1695465332742 implements MigrationInterface {
    name = 'AddDatesAndVersionToAnniversaries1695465332742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`anniversary\` 
                ADD COLUMN \`creationDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6), 
                ADD COLUMN \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                ADD COLUMN \`version\` int NOT NULL DEFAULT 1
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`anniversary\` 
                DROP COLUMN \`creationDate\`, 
                DROP COLUMN \`updateDate\`,
                DROP COLUMN \`version\`
            `);
    }

}
