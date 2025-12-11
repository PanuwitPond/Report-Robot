"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = require("minio");
let StorageService = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.endpoint = this.configService.get('MINIO_ENDPOINT') || 'localhost';
        const accessKey = this.configService.get('MINIO_ACCESS_KEY');
        const secretKey = this.configService.get('MINIO_SECRET_KEY');
        this.useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'report';
        const port = this.configService.get('MINIO_PORT')
            ? parseInt(this.configService.get('MINIO_PORT'))
            : (this.useSSL ? 443 : 9000);
        this.minioClient = new Minio.Client({
            endPoint: this.endpoint,
            port: port,
            useSSL: this.useSSL,
            accessKey: accessKey,
            secretKey: secretKey,
        });
        console.log(`🔍 Initializing MinIO client:`, {
            endpoint: this.endpoint,
            port: port,
            useSSL: this.useSSL,
            bucket: this.bucketName,
        });
    }
    async onModuleInit() {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (!bucketExists) {
                console.log(`📦 Bucket '${this.bucketName}' does not exist, creating...`);
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`✅ Bucket '${this.bucketName}' created successfully`);
            }
            else {
                console.log(`✅ MinIO connected successfully - Bucket '${this.bucketName}' exists`);
            }
        }
        catch (error) {
            console.error('❌ MinIO connection failed:', error.message);
            console.warn('⚠️  MinIO connection failed, but service will continue...');
        }
    }
    async getFileUrl(fileName, expirySeconds = 604800) {
        try {
            const url = await this.minioClient.presignedGetObject(this.bucketName, fileName, expirySeconds);
            console.log(`✅ Generated presigned URL for: ${fileName}`);
            return url;
        }
        catch (error) {
            console.error(`❌ Get file URL failed: ${fileName}`, error);
            throw error;
        }
    }
    async listObjects(prefix = '') {
        try {
            const normalizedPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;
            console.log(`📋 Listing objects with prefix: '${normalizedPrefix}'`);
            const objects = [];
            const seenPrefixes = new Set();
            const stream = this.minioClient.listObjects(this.bucketName, normalizedPrefix, false);
            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => {
                    if (obj.prefix && !seenPrefixes.has(obj.prefix)) {
                        seenPrefixes.add(obj.prefix);
                        objects.push({
                            name: obj.prefix,
                            size: 0,
                            lastModified: new Date(),
                            isDir: true,
                        });
                    }
                    if (obj.name && obj.name !== normalizedPrefix) {
                        objects.push({
                            name: obj.name,
                            size: obj.size || 0,
                            lastModified: obj.lastModified || new Date(),
                            isDir: false,
                        });
                    }
                });
                stream.on('end', () => {
                    console.log(`✅ Found ${objects.length} objects (folders + files)`);
                    resolve(objects);
                });
                stream.on('error', (err) => {
                    console.error('❌ List objects failed:', err);
                    reject(err);
                });
            });
        }
        catch (error) {
            console.error(`❌ List objects error:`, error);
            throw error;
        }
    }
    async uploadFile(file, domain, folder = 'uploads') {
        try {
            const fileName = `${domain}/${folder}/${Date.now()}-${file.originalname}`;
            await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, {
                'Content-Type': file.mimetype,
            });
            console.log(`✅ File uploaded successfully: ${fileName}`);
            return fileName;
        }
        catch (error) {
            console.error(`❌ File upload failed:`, error);
            throw error;
        }
    }
    async deleteFile(fileName) {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
            console.log(`✅ File deleted successfully: ${fileName}`);
        }
        catch (error) {
            console.error(`❌ File deletion failed: ${fileName}`, error);
            throw error;
        }
    }
    async getFile(fileName) {
        try {
            const dataStream = await this.minioClient.getObject(this.bucketName, fileName);
            return new Promise((resolve, reject) => {
                const chunks = [];
                dataStream.on('data', (chunk) => chunks.push(chunk));
                dataStream.on('end', () => resolve(Buffer.concat(chunks)));
                dataStream.on('error', reject);
            });
        }
        catch (error) {
            console.error(`❌ Get file failed: ${fileName}`, error);
            throw error;
        }
    }
    async downloadFile(fileName) {
        try {
            const stat = await this.minioClient.statObject(this.bucketName, fileName);
            const stream = await this.minioClient.getObject(this.bucketName, fileName);
            return {
                stream,
                size: stat.size,
                contentType: stat.metaData['content-type'] || 'application/octet-stream',
                etag: stat.etag,
            };
        }
        catch (error) {
            console.error(`❌ Download file failed: ${fileName}`, error);
            throw error;
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map