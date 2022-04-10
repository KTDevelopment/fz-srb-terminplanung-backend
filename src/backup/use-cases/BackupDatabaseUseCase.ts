import {DatabaseBackupService} from "../internal/DatabaseBackupService";
import {DumpGateway} from "../gateways/DumpGateway";
import {RemoteRepository} from "../gateways/RemoteRepository";
import {ConfigGateway} from "../gateways/ConfigGateway";

export interface BackupDatabaseUseCase {
    invoke(): Promise<void>
}

export function BackupDatabaseUseCase(
    dumpGateway: DumpGateway,
    remoteFileRepository: RemoteRepository,
    configGateway: ConfigGateway,
): BackupDatabaseUseCase {
    return new DatabaseBackupService(
        dumpGateway,
        remoteFileRepository,
        configGateway,
    )
}
