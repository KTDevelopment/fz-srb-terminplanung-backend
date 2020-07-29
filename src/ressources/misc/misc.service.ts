import {Injectable} from '@nestjs/common';
import {AppStoreLinksDto} from "./model/AppStoreLinks.dto";
import {plainToClass} from "class-transformer";
import {ConfigService} from "../../config/config.service";
import {DropBoxLinksDto} from "./model/DropBoxLinks.dto";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";

@Injectable()
export class MiscService {
    private persistenceDirectory: string;
    private dropBoxLinksFilePath: string;
    private fzAppStoreLinksFilePath: string;

    constructor(private readonly configService: ConfigService) {
        this.persistenceDirectory = configService.config.fileStorage.directory;
        this.dropBoxLinksFilePath = this.persistenceDirectory + '/dropBoxLinks.json';
        this.fzAppStoreLinksFilePath = this.persistenceDirectory + '/fzAppStoreLinks.json';
        this.ensurePersistenceDirectoryExists();
        this.ensureDropBoxLinksFileExists();
        this.ensureFzAppStoreLinksExists();
    }

    getFzAppStoreLinks(): AppStoreLinksDto {
        return plainToClass(AppStoreLinksDto, JSON.parse(
            readFileSync(this.fzAppStoreLinksFilePath).toString('utf8')
        ));
    }

    saveFzAppStoreLinks(newLinks: AppStoreLinksDto): AppStoreLinksDto {
        writeFileSync(this.fzAppStoreLinksFilePath, JSON.stringify(newLinks));
        return newLinks;
    }

    getDropBoxLinks(): DropBoxLinksDto {
        return plainToClass(DropBoxLinksDto, JSON.parse(
            readFileSync(this.dropBoxLinksFilePath).toString('utf8')
        ));
    }

    saveDropBoxLinks(newLinks: DropBoxLinksDto): DropBoxLinksDto {
        writeFileSync(this.dropBoxLinksFilePath, JSON.stringify(newLinks));
        return newLinks;
    }

    private ensureDropBoxLinksFileExists() {
        MiscService.ensureFileExists(this.dropBoxLinksFilePath, '{"main": "", "music": "", "drill": ""}')
    }

    private ensureFzAppStoreLinksExists() {
        MiscService.ensureFileExists(this.fzAppStoreLinksFilePath, '{"iosLink": "https://itunes.apple.com/de/app/fanfarenzug-strausberg-app/id1439365342?mt=8", "androidLink": "https://play.google.com/store/apps/details?id=com.fanfarenzugstrausbergapp"}')
    }

    private static ensureFileExists(path: string, defaultContent: string) {
        if (!existsSync(path)) {
            writeFileSync(path, defaultContent)
        }
    }

    private ensurePersistenceDirectoryExists() {
        if (!existsSync(this.persistenceDirectory)) {
            mkdirSync(this.persistenceDirectory)
        }
    }
}
