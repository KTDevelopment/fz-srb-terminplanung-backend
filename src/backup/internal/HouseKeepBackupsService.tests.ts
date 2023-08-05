import {HouseKeepBackupsService} from "./HouseKeepBackupsService";
import {RemoteFileRepositoryFake} from "../../../test/fakes/RemoteFileRepositoryFake";

describe("HouseKeepBackupsService", () => {
    let houseKeepBackupsService: HouseKeepBackupsService;
    let remoteFileRepository: RemoteFileRepositoryFake;

    beforeEach(async () => {
        remoteFileRepository = new RemoteFileRepositoryFake()
        houseKeepBackupsService = new HouseKeepBackupsService(
            remoteFileRepository
        );
    });

    it('should not remove files when there are less than 10', async () => {
        [...Array(10).keys()].forEach((value, index) => {
            remoteFileRepository.save("foo " + index)
        })

        await houseKeepBackupsService.invoke()

        expect(remoteFileRepository.files.length).toBe(10)
    });

    it('should remove oldest files until there are 10 left', async () => {
        const expectedFiles = [...Array(10).keys()].map((value, index) => {
            const day = (index + 20).toString().padStart(2, "0")
            return `BACKUP_2020-02-01T18:${day}:00.000Z.sql`
        })
        const all = shuffle(expectedFiles.concat([...Array(10).keys()].map((value, index) => {
            const day = (index + 1).toString().padStart(2, "0")
            return `BACKUP_2020-02-01T18:${day}:00.000Z.sql`
        })))

        all.forEach(file => remoteFileRepository.save(file))

        await houseKeepBackupsService.invoke()

        expect(remoteFileRepository.files.length).toBe(expectedFiles.length)
        expect(remoteFileRepository.files.every(file => expectedFiles.includes(file))).toBeTruthy()
    });

    function shuffle(array: string[]) {
        let currentIndex: number = array.length;
        let randomIndex: number;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
})
