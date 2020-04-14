import {MigrationInterface, QueryRunner} from "typeorm";

export class AnniversariesVersioning1582485796504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `anniversary_temp` (`anniversaryId` int NOT NULL AUTO_INCREMENT, `performanceCount` int NOT NULL, `eventId` int NOT NULL, `memberId` int NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL DEFAULT 1, PRIMARY KEY (`anniversaryId`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("insert into anniversary_temp(anniversaryId, performanceCount, eventId, memberId) select anniversaryId, performanceCount, eventId, memberId from anniversary");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_ae97df036691ce93de6ef61c320`");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_f856daa81f746664183d90903a9`");
        await queryRunner.query(`drop table anniversary`);
        await queryRunner.query(`alter table anniversary_temp rename to anniversary`);
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `anniversary_temp` (`anniversaryId` int NOT NULL AUTO_INCREMENT, `performanceCount` int NOT NULL, `memberId` int NOT NULL, `eventId` int NULL, PRIMARY KEY (`anniversaryId`)) ENGINE=InnoDB");
        await queryRunner.query("insert into anniversary_temp(anniversaryId, performanceCount, eventId, memberId) select anniversaryId, performanceCount, eventId, memberId from anniversary");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_ae97df036691ce93de6ef61c320`");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_f856daa81f746664183d90903a9`");
        await queryRunner.query(`drop table anniversary`);
        await queryRunner.query(`alter table anniversary_temp rename to anniversary`);
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");

    }

}
