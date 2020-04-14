import {MigrationInterface, QueryRunner} from "typeorm";

export class OnDeleteCascadeParticipation1541576050483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query("ALTER TABLE `event` CHANGE `startDate` `startDate` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `endDate` `endDate` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `longitude` `longitude` double NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `latitude` `latitude` double NOT NULL");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query("ALTER TABLE `event` CHANGE `latitude` `latitude` double(22) NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `longitude` `longitude` double(22) NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `endDate` `endDate` datetime(0) NOT NULL");
        await queryRunner.query("ALTER TABLE `event` CHANGE `startDate` `startDate` datetime(0) NOT NULL");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`) ON DELETE RESTRICT ON UPDATE RESTRICT");
    }

}
