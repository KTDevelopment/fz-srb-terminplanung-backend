import {HouseKeepBackupsService} from "../internal/HouseKeepBackupsService";
import {RemoteRepository} from "../gateways/RemoteRepository";

export interface DoBackupHouseKeepingUseCase {
    invoke(): Promise<void>
}

export function DoBackupHouseKeepingUseCase(
    remoteFileRepository: RemoteRepository
) {
    return new HouseKeepBackupsService(
        remoteFileRepository
    )
}
