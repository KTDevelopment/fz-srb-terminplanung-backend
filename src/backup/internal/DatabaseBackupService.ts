import {DumpGateway} from "../gateways/DumpGateway";
import {RemoteRepository} from "../gateways/RemoteRepository";
import {BackupDatabaseUseCase} from "../use-cases/BackupDatabaseUseCase";
import {ConfigGateway} from "../gateways/ConfigGateway";
import {existsSync, rm} from "fs";

export class DatabaseBackupService implements BackupDatabaseUseCase {
    constructor(
        private readonly dumpGateway: DumpGateway,
        private readonly remoteFileRepository: RemoteRepository,
        private readonly configGateway: ConfigGateway,
    ) {
    }

    async invoke() {
        const fileName = this.getFileName()

        await this.dumpGateway.createDumpAndSaveTo(fileName)
        await this.remoteFileRepository.save(fileName)
        if (existsSync(fileName)) {
            await this.removeTempBackup(fileName)
        }
    }

    private getFileName(): string {
        const now = new Date();
        const test = now.toJSON()

        const tempDir = this.configGateway.getTempDir()
        const env = this.configGateway.getCurrentEnvironment()
        return `${tempDir}/${env}_DB_BACKUP_${test}.sql`
    }

    private async removeTempBackup(fileName: string) {
        return new Promise<void>((resolve, reject) => {
            rm(fileName, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })

    }
}
