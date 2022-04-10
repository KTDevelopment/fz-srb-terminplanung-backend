import {DatabaseBackupService} from "./DatabaseBackupService";
import {DumpGateway} from "../gateways/DumpGateway";
import {ConfigGateway} from "../gateways/ConfigGateway";
import {RemoteFileRepositoryFake} from "../../../test/fakes/RemoteFileRepositoryFake";

describe('DatabaseDumpCreatorTest', () => {
    let databaseDumpCreator: DatabaseBackupService;
    let dumpGateway: DumpGatewayFake;
    let configGateway: ConfigGatewayFake;
    let remoteFileRepository: RemoteFileRepositoryFake;

    beforeEach(async () => {
        dumpGateway = new DumpGatewayFake()
        configGateway = new ConfigGatewayFake(
            "test",
            "test/test-backup-temp"
        )
        remoteFileRepository = new RemoteFileRepositoryFake()
        databaseDumpCreator = new DatabaseBackupService(
            dumpGateway,
            remoteFileRepository,
            configGateway
        );
    });

    it('should create fileName with date and time', async () => {
        const mockDateObject = new Date("2020-02-17T18:00:00.000Z");
        const dateSpy = jest
            .spyOn(global, 'Date')
            .mockImplementation(() => mockDateObject as any)
        await databaseDumpCreator.invoke()
        dateSpy.mockRestore()
        expect(dumpGateway.fileName).toContain("DB_BACKUP_2020-02-17T18:00:00.000Z.sql");
        expect(dumpGateway.fileName).toContain(configGateway.env);
        expect(dumpGateway.fileName).toContain(configGateway.tempDir);
    });

    it('should save file in remote repository', async () => {
        await databaseDumpCreator.invoke()
        expect(remoteFileRepository.files[0]).toContain("DB_BACKUP");
        expect(remoteFileRepository.files[0]).toContain(configGateway.env);
        expect(remoteFileRepository.files[0]).toContain(configGateway.tempDir);
    });
});

class DumpGatewayFake implements DumpGateway {
    fileName

    createDumpAndSaveTo(absoluteFileName: string): Promise<void> {
        this.fileName = absoluteFileName;
        return Promise.resolve(undefined);
    }
}

class ConfigGatewayFake implements ConfigGateway {


    constructor(
        readonly env = "test",
        readonly tempDir = ""
    ) {
    }

    getCurrentEnvironment(): string {
        return this.env;
    }

    getTempDir(): string {
        return this.tempDir;
    }

}


