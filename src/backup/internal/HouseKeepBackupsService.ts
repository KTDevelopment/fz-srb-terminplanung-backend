import {DoBackupHouseKeepingUseCase} from "../use-cases/DoBackupHouseKeepingUseCase";
import {RemoteRepository} from "../gateways/RemoteRepository";

export class HouseKeepBackupsService implements DoBackupHouseKeepingUseCase {
    constructor(
        private readonly remoteFileRepository: RemoteRepository,
    ) {
    }

    async invoke() {
        const currentFiles = await this.remoteFileRepository.list()

        const filesToBeDeleted = currentFiles
            .sort((a, b) => {
                const dateA = HouseKeepBackupsService.extractDate(a)
                const dateB = HouseKeepBackupsService.extractDate(b)

                if (dateA == dateB) {
                    return 0
                }

                if (dateA < dateB) {
                    return 1
                } else {
                    return -1
                }
            })
            .slice(10)

        if (filesToBeDeleted.length) {
            await this.remoteFileRepository.remove(filesToBeDeleted)
        }
    }

    private static extractDate(fileName: string): Date {
        return new Date(fileName.replace(".sql", "").split("BACKUP_")[1])
    }
}
