import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactorUniqueIndexOfStatisticsEntry1691680111119 implements MigrationInterface {
    name = 'RefactorUniqueIndexOfStatisticsEntry1691680111119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`statistics_entry\`
                DROP KEY UniqueEventSectionId;
        `);
        await queryRunner.query(`
            ALTER TABLE \`statistics_entry\`
                ADD CONSTRAINT UniqueEventSectionId UNIQUE (\`eventId\`, \`sectionId\`, \`name\`);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`statistics_entry\`
                DROP INDEX UniqueEventSectionId;
        `);
        await queryRunner.query(`
            ALTER TABLE \`statistics_entry\`
                ADD CONSTRAINT UniqueEventSectionId UNIQUE (\`eventId\`, \`sectionId\`);
        `);
    }

}
