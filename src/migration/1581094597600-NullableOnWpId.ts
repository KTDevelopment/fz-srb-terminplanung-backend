import {MigrationInterface, QueryRunner} from "typeorm";

export class NullableOnWpId1581094597600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `event_temp` (`eventId` int NOT NULL AUTO_INCREMENT, `wpId` bigint, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `summary` text NOT NULL, `description` text NOT NULL, `eventName` varchar(255) NOT NULL, `location` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `postcode` int NOT NULL, `town` varchar(255) NOT NULL, `dress` varchar(255) NOT NULL, `participatingGroup` varchar(255) NOT NULL, `category` varchar(255) NOT NULL, `longitude` double NOT NULL, `latitude` double NOT NULL, `isPublic` tinyint NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`eventId`)) ENGINE=InnoDB");
        await queryRunner.query("insert into event_temp(eventId, wpId, startDate, endDate, summary, description, eventName, location, address, postcode, town, dress, participatingGroup, category, longitude, latitude, isPublic, creationDate, updateDate, version) select eventId, wpId, startDate, endDate, summary, description, eventName, location, address, postcode, town, dress, participatingGroup, category, longitude, latitude, isPublic, creationDate, updateDate, version from event");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_ae97df036691ce93de6ef61c320`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query(`drop table event`);
        await queryRunner.query(`alter table event_temp rename to event`);
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `event_temp` (`eventId` int NOT NULL AUTO_INCREMENT, `wpId` bigint NOT NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `summary` text NOT NULL, `description` text NOT NULL, `eventName` varchar(255) NOT NULL, `location` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `postcode` int NOT NULL, `town` varchar(255) NOT NULL, `dress` varchar(255) NOT NULL, `participatingGroup` varchar(255) NOT NULL, `category` varchar(255) NOT NULL, `longitude` double NOT NULL, `latitude` double NOT NULL, `isPublic` tinyint NOT NULL, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`eventId`)) ENGINE=InnoDB");
        await queryRunner.query("insert into event_temp(eventId, wpId, startDate, endDate, summary, description, eventName, location, address, postcode, town, dress, participatingGroup, category, longitude, latitude, isPublic, creationDate, updateDate, version) select eventId, IFNULL(wpId, 0) as wpId, startDate, endDate, summary, description, eventName, location, address, postcode, town, dress, participatingGroup, category, longitude, latitude, isPublic, creationDate, updateDate, version from event");
        await queryRunner.query("ALTER TABLE `anniversary` DROP FOREIGN KEY `FK_ae97df036691ce93de6ef61c320`");
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query(`drop table event`);
        await queryRunner.query(`alter table event_temp rename to event`);
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
    }

}
