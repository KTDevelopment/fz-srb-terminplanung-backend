import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactorMember1580991267274 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `member` DROP COLUMN `refreshToken`");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `member` ADD `refreshToken` varchar(255) NULL");
    }

}
