export interface DumpGateway {
    createDumpAndSaveTo(absoluteFileName: string): Promise<void>
}
