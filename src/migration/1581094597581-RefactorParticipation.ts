import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactorParticipation1581094597581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`create table participation_temp (
                                                memberId int not null,
                                                eventId int not null,
                                                stateId int default 0 not null,
                                                creationDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                updateDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                version integer not null,
                                                id int not null AUTO_INCREMENT,
                                                PRIMARY KEY (id)
                                                )`);
        await queryRunner.query("insert into participation_temp(memberId, eventId, stateId, creationDate, updateDate, version) select memberId, eventId, stateId, creationDate, updateDate, version from participation");
        await queryRunner.query(`drop table participation;`);
        await queryRunner.query(`alter table participation_temp rename to participation`);

        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_14457e2847e37cdd6b8452e728d` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_3b987e2744d15a8d8884f52fa36` FOREIGN KEY (`stateId`) REFERENCES `participation_state`(`stateId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `participation_temp` (`memberId` int NOT NULL, `eventId` int NOT NULL, `stateId` int NOT NULL DEFAULT 0, `creationDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, PRIMARY KEY (`memberId`, `eventId`)) ENGINE=InnoDB");
        await queryRunner.query(`insert into participation_temp(memberId, eventId, stateId, creationDate, updateDate, version) select memberId, eventId, stateId, creationDate, updateDate, version from participation;`);
        await queryRunner.query(`drop table participation;`);
        await queryRunner.query(`alter table participation_temp rename to participation`);

        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_14457e2847e37cdd6b8452e728d` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_3b987e2744d15a8d8884f52fa36` FOREIGN KEY (`stateId`) REFERENCES `participation_state`(`stateId`)");
    }

}
