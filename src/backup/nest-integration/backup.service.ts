import {Injectable, OnApplicationBootstrap} from "@nestjs/common";
import {Cron, CronExpression} from "@nestjs/schedule";
import {GoogleDriveUploader} from "./GoogleDriveUploader";
import {ConfigService} from "../../config/config.service";
import {ApplicationLogger} from "../../logger/application-logger.service";
import {BackupDatabaseUseCase} from "../use-cases/BackupDatabaseUseCase";
import {DoBackupHouseKeepingUseCase} from "../use-cases/DoBackupHouseKeepingUseCase";
import {DatabaseDumpService} from "./DatabaseDumpService";
import {BackupConfigService} from "./BackupConfigService";
import {GoogleDriveClient} from "./GoogleDriveClient";

@Injectable()
export class BackupService implements OnApplicationBootstrap {

    private backupDatabaseUseCase: BackupDatabaseUseCase
    private doBackupHouseKeepingUseCase: DoBackupHouseKeepingUseCase

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: ApplicationLogger
    ) {
        logger.setContext(BackupService.name)
        const config = configService.config
        const uploader = new GoogleDriveUploader(
            new GoogleDriveClient(
                config.backup.driveConfig,
                config.backup.driveDirectoryName
            )
        )
        this.backupDatabaseUseCase = BackupDatabaseUseCase(
            new DatabaseDumpService(
                {
                    host: config.database.host,
                    database: config.database.database,
                    port: config.database.port,
                    username: config.database.username,
                    password: config.database.password,
                }
            ),
            uploader,
            new BackupConfigService(this.configService)
        )
        this.doBackupHouseKeepingUseCase = DoBackupHouseKeepingUseCase(
            uploader
        )
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async backUpDatabase() {
        if (this.configService.config.backup.enabled) {
            try {
                await this.backupDatabaseUseCase.invoke()
                this.logger.log("database backup finished")
            } catch (e) {
                this.logger.error(e, "database backup failed")
            }
        } else {
            this.logger.log("database backup is disabled")
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanUpBackups() {
        if (this.configService.config.backup.enabled) {
            try {
                await this.doBackupHouseKeepingUseCase.invoke()
                this.logger.log("cleanup database backup finished")
            } catch (e) {
                this.logger.error(e, "cleanup database backup failed")
            }
        } else {
            this.logger.log("cleanup database backup is disabled")
        }
    }

    onApplicationBootstrap(): any {
        this.backUpDatabase().catch(this.logger.error)
    }

}
