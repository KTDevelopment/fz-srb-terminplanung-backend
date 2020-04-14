import {MigrationInterface, QueryRunner} from "typeorm";

export class AllTables1536785986910 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `section` (`sectionId` int NOT NULL, `sectionName` varchar(255) NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`sectionId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `role` (`roleId` int NOT NULL, `roleName` varchar(255) NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`roleId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `device` (`deviceId` int NOT NULL AUTO_INCREMENT, `registrationId` varchar(255) NOT NULL, `deviceType` varchar(255) NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `memberMemberId` int NULL, PRIMARY KEY (`deviceId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `member` (`memberId` int NOT NULL AUTO_INCREMENT, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `performanceCount` int NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `refreshToken` varchar(255) NULL, `isDeleted` tinyint NOT NULL DEFAULT 0, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `sectionSectionId` int NULL, PRIMARY KEY (`memberId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `event` (`eventId` int NOT NULL AUTO_INCREMENT, `wpId` bigint NOT NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `summary` text NOT NULL, `description` text NOT NULL, `eventName` varchar(255) NOT NULL, `location` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `postcode` int NOT NULL, `town` varchar(255) NOT NULL, `dress` varchar(255) NOT NULL, `participatingGroup` varchar(255) NOT NULL, `category` varchar(255) NOT NULL, `longitude` double NOT NULL, `latitude` double NOT NULL, `isPublic` tinyint NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`eventId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `anniversary` (`anniversaryId` int NOT NULL AUTO_INCREMENT, `performanceCount` int NOT NULL, `memberId` int NOT NULL, `eventId` int NULL, PRIMARY KEY (`anniversaryId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `participation_state` (`stateId` int NOT NULL, `stateName` varchar(255) NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`stateId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `participation` (`memberId` int NOT NULL, `eventId` int NOT NULL, `stateId` int NOT NULL DEFAULT 0, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`memberId`, `eventId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `member_roles_role` (`memberMemberId` int NOT NULL, `roleRoleId` int NOT NULL, PRIMARY KEY (`memberMemberId`, `roleRoleId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `device` ADD CONSTRAINT `FK_68dfdbfda82287a40d359be8e70` FOREIGN KEY (`memberMemberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `member` ADD CONSTRAINT `FK_f00438443ecc9ebc9ad515c03b2` FOREIGN KEY (`sectionSectionId`) REFERENCES `section`(`sectionId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_14457e2847e37cdd6b8452e728d` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_3b987e2744d15a8d8884f52fa36` FOREIGN KEY (`stateId`) REFERENCES `participation_state`(`stateId`)");
        await queryRunner.query("ALTER TABLE `member_roles_role` ADD CONSTRAINT `FK_417379f8872745b0b3f472f436e` FOREIGN KEY (`memberMemberId`) REFERENCES `member`(`memberId`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `member_roles_role` ADD CONSTRAINT `FK_fe315decf6c4d8fc53255b8653a` FOREIGN KEY (`roleRoleId`) REFERENCES `role`(`roleId`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `member_roles_role` DROP FOREIGN KEY `FK_fe315decf6c4d8fc53255b8653a`");
        await queryRunner.query("ALTER TABLE `member_roles_role` DROP FOREIGN KEY `FK_417379f8872745b0b3f472f436e`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_3b987e2744d15a8d8884f52fa36`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_14457e2847e37cdd6b8452e728d`");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_ae97df036691ce93de6ef61c320`");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_f856daa81f746664183d90903a9`");
        await queryRunner.query("ALTER TABLE `member` DROP FOREIGN KEY `FK_f00438443ecc9ebc9ad515c03b2`");
        await queryRunner.query("ALTER TABLE `device` DROP FOREIGN KEY `FK_68dfdbfda82287a40d359be8e70`");
        await queryRunner.query("DROP TABLE `member_roles_role`");
        await queryRunner.query("DROP TABLE `participation`");
        await queryRunner.query("DROP TABLE `participation_state`");
        await queryRunner.query("DROP TABLE `anniversary`");
        await queryRunner.query("DROP TABLE `event`");
        await queryRunner.query("DROP TABLE `member`");
        await queryRunner.query("DROP TABLE `device`");
        await queryRunner.query("DROP TABLE `role`");
        await queryRunner.query("DROP TABLE `section`");
    }

}
