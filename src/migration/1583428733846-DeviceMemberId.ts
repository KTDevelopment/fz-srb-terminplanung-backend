import {MigrationInterface, QueryRunner} from "typeorm";

export class DeviceMemberId1583428733846 implements MigrationInterface {
    name = 'DeviceMemberId1583428733846';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `device` DROP FOREIGN KEY `FK_68dfdbfda82287a40d359be8e70`", undefined);
        await queryRunner.query("ALTER TABLE `device` CHANGE `memberMemberId` `memberId` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `device` CHANGE `memberId` `memberId` int NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `device` ADD CONSTRAINT `FK_a2d4a67ca79476d3c3403f7a5da` FOREIGN KEY (`memberId`) REFERENCES `member`(`memberId`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `device` DROP FOREIGN KEY `FK_a2d4a67ca79476d3c3403f7a5da`", undefined);
        await queryRunner.query("ALTER TABLE `device` CHANGE `memberId` `memberId` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `device` CHANGE `memberId` `memberMemberId` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `device` ADD CONSTRAINT `FK_68dfdbfda82287a40d359be8e70` FOREIGN KEY (`memberMemberId`, `memberMemberId`) REFERENCES `member`(`memberId`,`memberId`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

}
