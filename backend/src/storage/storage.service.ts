import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT'),
            port: parseInt(this.configService.get('MINIO_PORT')),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get('MINIO_SECRET_KEY'),
        });
        this.bucketName = this.configService.get('MINIO_BUCKET');
    }

    async onModuleInit() {
        // TODO: Enable MinIO when ready
        // Temporarily disabled to allow backend to start without MinIO
        console.log('⚠️ MinIO initialization skipped - MinIO not running');

        // Uncomment when MinIO is running:
        // const exists = await this.minioClient.bucketExists(this.bucketName);
        // if (!exists) {
        //     await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        //     console.log(`✅ Bucket ${this.bucketName} created`);
        // }
    }

    async uploadFile(
        file: Express.Multer.File,
        domain: string,
        folder: string = 'uploads',
    ): Promise<string> {
        const fileName = `${domain}/${folder}/${Date.now()}-${file.originalname}`;

        await this.minioClient.putObject(
            this.bucketName,
            fileName,
            file.buffer,
            file.size,
            {
                'Content-Type': file.mimetype,
            },
        );

        return fileName;
    }

    async getFileUrl(fileName: string, expirySeconds: number = 24 * 60 * 60): Promise<string> {
        return this.minioClient.presignedGetObject(
            this.bucketName,
            fileName,
            expirySeconds,
        );
    }

    async deleteFile(fileName: string): Promise<void> {
        await this.minioClient.removeObject(this.bucketName, fileName);
    }

    async getFile(fileName: string): Promise<Buffer> {
        const stream = await this.minioClient.getObject(this.bucketName, fileName);
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
}
