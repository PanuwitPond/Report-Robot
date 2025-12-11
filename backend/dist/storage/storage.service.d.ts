import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class StorageService implements OnModuleInit {
    private configService;
    private minioClient;
    private bucketName;
    private endpoint;
    private useSSL;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getFileUrl(fileName: string, expirySeconds?: number): Promise<string>;
    listObjects(prefix?: string): Promise<Array<{
        name: string;
        size: number;
        lastModified: Date;
        isDir: boolean;
    }>>;
    uploadFile(file: Express.Multer.File, domain: string, folder?: string): Promise<string>;
    deleteFile(fileName: string): Promise<void>;
    getFile(fileName: string): Promise<Buffer>;
    downloadFile(fileName: string): Promise<{
        stream: any;
        size: number;
        contentType: string;
        etag?: string;
    }>;
}
