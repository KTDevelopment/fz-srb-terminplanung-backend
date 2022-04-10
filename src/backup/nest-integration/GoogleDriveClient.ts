import {drive_v3, google} from "googleapis";
import {Injectable} from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import Drive = drive_v3.Drive;

@Injectable()
export class GoogleDriveClient {

    private drive: Drive = undefined
    private parentDirectoryId: string = undefined

    constructor(
        private readonly config: DriveConfig,
        private readonly driveDirectoryName: string,
    ) {
    }

    async upload(absoluteFilePath: string) {
        await this.ensureClient()

        await this.drive.files.create({
            requestBody: {
                mimeType: "text/sql",
                name: absoluteFilePath.split(path.sep).pop(),
                parents: [this.parentDirectoryId]
            },
            media: {
                mimeType: 'text/sql',
                body: fs.readFileSync(absoluteFilePath).toString(),
            },
        })
    }

    async list(): Promise<string[]> {
        await this.ensureClient()

        return (await this.drive.files.list({
            q: `'${this.parentDirectoryId}' in parents and trashed=false`,
            pageSize: 25,
            fields: 'nextPageToken, files(name)',
        })).data.files.map(it => it.name)
    }

    async remove(fileNames: string[]) {
        await this.ensureClient()
        const ids = (await this.drive.files.list({
            q: `'${this.parentDirectoryId}' in parents and trashed=false`,
            pageSize: 25,
            fields: 'nextPageToken, files(id, name)',
        })).data.files.filter(it => fileNames.includes(it.name)).map(it => it.id)

        await Promise.all(ids.map(id => this.drive.files.delete({
            fileId: id
        })))
    }

    private async ensureClient() {
        if (this.drive === undefined) {
            const authClient = await this.authorize()
            this.drive = google.drive({version: 'v3', auth: authClient})

            const directoryId = (await this.drive.files.list({
                q: `mimeType = 'application/vnd.google-apps.folder' and name = '${this.driveDirectoryName}'`,
                pageSize: 25,
                fields: 'nextPageToken, files(name, id)',
            })).data.files[0]?.id;

            if (directoryId == undefined) {
                throw new Error(`BackUp diretory: ${this.driveDirectoryName} not found on drive`)
            }
            this.parentDirectoryId = directoryId
        }
    }

    private async authorize(): Promise<any> {
        const jwtClient = new google.auth.JWT({
            email: this.config.client_email,
            key: this.config.private_key,
            keyId: this.config.private_key_id,
            scopes: [
                'https://www.googleapis.com/auth/drive'
            ]
        })

        const credentials = await jwtClient.authorize()
        jwtClient.setCredentials(credentials)
        return jwtClient
    }
}
