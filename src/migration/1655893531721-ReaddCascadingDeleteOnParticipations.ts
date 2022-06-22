import {MigrationInterface, QueryRunner} from "typeorm";

export class ReaddCascadingDeleteOnParticipations1655893531721 implements MigrationInterface {
    name = 'ReaddCascadingDeleteOnParticipations1655893531721'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `participation` DROP FOREIGN KEY `FK_834f264f10c81e99c5355c3255f`");
        await queryRunner.query("ALTER TABLE `participation` ADD CONSTRAINT `FK_834f264f10c81e99c5355c3255f` FOREIGN KEY (`eventId`) REFERENCES `event`(`eventId`)");
    }

}
