import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class StorageService implements OnModuleInit {
    private configService;
    private minioClient;
    private bucketName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(file: Express.Multer.File, domain: string, folder?: string): Promise<string>;
    getFileUrl(fileName: string, expirySeconds?: number): Promise<string>;
    deleteFile(fileName: string): Promise<void>;
    getFile(fileName: string): Promise<Buffer>;
    listFiles(prefix?: string, recursive?: boolean): Promise<any[]>;
}
