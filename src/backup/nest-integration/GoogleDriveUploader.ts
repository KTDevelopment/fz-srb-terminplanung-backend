import {GoogleDriveClient} from "./GoogleDriveClient";
import {RemoteRepository} from "../gateways/RemoteRepository";

export class GoogleDriveUploader implements RemoteRepository {

    constructor(
        private readonly googleDriveClient: GoogleDriveClient,
    ) {
    }

    list(): Promise<string[]> {
        return this.googleDriveClient.list();
    }

    async remove(fileNames: string[]) {
        return this.googleDriveClient.remove(fileNames);
    }

    async save(absoluteFilePath: string) {
        await this.googleDriveClient.upload(absoluteFilePath)
    }
}
