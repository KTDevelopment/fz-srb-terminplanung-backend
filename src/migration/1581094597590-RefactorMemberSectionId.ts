import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactorMemberSectionId1581094597590 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `member_tmp` (`memberId` int NOT NULL AUTO_INCREMENT, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `performanceCount` int NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `isDeleted` tinyint NOT NULL DEFAULT 0, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `sectionId` int NOT NULL, PRIMARY KEY (`memberId`)) ENGINE=InnoDB");
        await queryRunner.query("insert into member_tmp(memberId, firstName, lastName, performanceCount, email, password, isDeleted, creationDate, updateDate, version, sectionId) select memberId, firstName, lastName, performanceCount, email, password, isDeleted, creationDate, updateDate, version, sectionSectionId from member");

        this.dropAndRename(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `member_tmp` (`memberId` int NOT NULL AUTO_INCREMENT, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `performanceCount` int NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `isDeleted` tinyint NOT NULL DEFAULT 0, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `sectionSectionId` int NOT NULL, PRIMARY KEY (`memberId`)) ENGINE=InnoDB");
        await queryRunner.query("insert into member_tmp(memberId, firstName, lastName, performanceCount, email, password, isDeleted, creationDate, updateDate, version, sectionSectionId) select memberId, firstName, lastName, performanceCount, email, password, isDeleted, creationDate, updateDate, version, sectionId from member");

        this.dropAndRename(queryRunner);
    }

    private async dropAndRename(queryRunner: QueryRunner) {
        await queryRunner.query("ALTER TABLE `device` DROP FOREIGN KEY `FK_68dfdbfda82287a40d359be8e70`");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_f856daa81f746664183d90903a9`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_14457e2847e37cdd6b8452e728d`");
        await queryRunner.query("ALTER TABLE `member_roles_role` DROP FOREIGN KEY `FK_417379f8872745b0b3f472f436e`");

        await queryRunner.query(`drop table member`);
        await queryRunner.query(`alter table member_tmp rename to member`);

        await queryRunner.query("ALTER TABLE `member` ADD CONSTRAINT `FK_f00438443ecc9ebc9ad515c03b2` FOREIGN KEY (`sectionId`) REFERENCES `section`(`sectionId`)");
        await queryRunner.query("ALTER TABLE `device` ADD CONSTRAINT `FK_68dfdbfda82287a40d359be8e70` FOREIGN KEY (`memberMemberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_14457e2847e37cdd6b8452e728d` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `member_roles_role` ADD CONSTRAINT `FK_417379f8872745b0b3f472f436e` FOREIGN KEY (`memberMemberId`) REFERENCES `member`(`memberId`) ON DELETE CASCADE");
    }
}
