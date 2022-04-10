import {RemoteRepository} from "../../src/backup/gateways/RemoteRepository";

export class RemoteFileRepositoryFake implements RemoteRepository {
    files = []

    save(absoluteFilePath: string): Promise<void> {
        this.files.push(absoluteFilePath)
        return Promise.resolve(undefined);
    }

    list(): Promise<string[]> {
        return Promise.resolve(this.files);
    }

    remove(fileNames: string[]): Promise<void> {
        this.files = this.files.filter(file => !fileNames.includes(file))
        return Promise.resolve(undefined);
    }
}
