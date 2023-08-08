import {MigrationInterface, QueryRunner} from "typeorm";

export class IntroduceNewStatistics1691330165767 implements MigrationInterface {
    name = 'IntroduceNewStatistics1691330165767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`statistics_entry\`
            (
                \`creationDate\`   datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                \`updateDate\`     datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                \`version\`        int          NOT NULL,
                \`id\`             int          NOT NULL AUTO_INCREMENT,
                \`name\`           varchar(255) NOT NULL,
                \`locationString\` varchar(255) NOT NULL,
                \`date\`           datetime     NOT NULL,
                \`eventId\`        int          NOT NULL,
                \`sectionId\`      int          NOT NULL,
                \`isProcessed\`    tinyint      NOT NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT UniqueEventSectionId UNIQUE (\`eventId\`, \`sectionId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`statistics_deletion_protocol\`
            (
                \`creationDate\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                \`updateDate\`          datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                \`version\`             int          NOT NULL,
                \`id\`                  int          NOT NULL AUTO_INCREMENT,
                \`memberId\`            int          NOT NULL,
                \`statisticsEntryId\`   int          NOT NULL,
                \`performanceCount\`    int          NOT NULL,
                \`deletingMemeberId\`   int          NOT NULL,
                \`deletingMemeberName\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`statistics_participation\`
            (
                \`creationDate\`      datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                \`updateDate\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                \`version\`           int NOT NULL,
                \`id\`                int NOT NULL AUTO_INCREMENT,
                \`memberId\`          int NOT NULL,
                \`statisticsEntryId\` int NOT NULL,
                \`performanceCount\`  int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`statistics_participation\`
                ADD CONSTRAINT \`FK_be7f32a2912fc03f7005c5a972c\` FOREIGN KEY (\`memberId\`) REFERENCES \`member\` (\`memberId\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`statistics_participation\`
                ADD CONSTRAINT \`FK_2f169ca8b6b00fe8225ab00ad4e\` FOREIGN KEY (\`statisticsEntryId\`) REFERENCES \`statistics_entry\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`anniversary\` DROP FOREIGN KEY \`FK_f856daa81f746664183d90903a9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`anniversary\` DROP FOREIGN KEY \`FK_ae97df036691ce93de6ef61c320\`
        `);
        await queryRunner.query(`
            DROP TABLE \`anniversary\`
        `);
        await queryRunner.query("CREATE TABLE `anniversary` (`anniversaryId` int NOT NULL AUTO_INCREMENT, `performanceCount` int NOT NULL, `memberId` int NOT NULL, `statisticsEntryId` int NULL, PRIMARY KEY (`anniversaryId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`statisticsEntryId`) REFERENCES `statistics_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`statistics_participation\` DROP FOREIGN KEY \`FK_2f169ca8b6b00fe8225ab00ad4e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`statistics_participation\` DROP FOREIGN KEY \`FK_be7f32a2912fc03f7005c5a972c\`
        `);
        await queryRunner.query(`
            DROP TABLE \`statistics_participation\`
        `);
        await queryRunner.query(`
            DROP TABLE \`statistics_deletion_protocol\`
        `);
        await queryRunner.query(`
            DROP TABLE \`statistics_entry\`
        `);

        await queryRunner.query(`
            ALTER TABLE \`anniversary\` DROP FOREIGN KEY \`FK_f856daa81f746664183d90903a9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`anniversary\` DROP FOREIGN KEY \`FK_ae97df036691ce93de6ef61c320\`
        `);
        await queryRunner.query(`
            DROP TABLE \`anniversary\`
        `);
        await queryRunner.query("CREATE TABLE `anniversary` (`anniversaryId` int NOT NULL AUTO_INCREMENT, `performanceCount` int NOT NULL, `memberId` int NOT NULL, `eventId` int NULL, PRIMARY KEY (`anniversaryId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_f856daa81f746664183d90903a9` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`)");
        await queryRunner.query("ALTER TABLE `anniversary` ADD CONSTRAINT `FK_ae97df036691ce93de6ef61c320` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
    }

}
