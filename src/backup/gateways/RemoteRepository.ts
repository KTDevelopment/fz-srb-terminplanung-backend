export interface RemoteRepository {
    save(absoluteFilePath: string): Promise<void>

    list(): Promise<string[]>

    remove(fileNames: string[]): Promise<void>
}
