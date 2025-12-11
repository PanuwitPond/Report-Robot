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
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`✅ Bucket ${this.bucketName} created`);
            }
            else {
                console.log(`✅ Connected to MinIO Bucket: ${this.bucketName}`);
            }
        }
        catch (error) {
            console.error('❌ MinIO Connection Failed:', error);
        }
    }
    async uploadFile(file, domain, folder = 'uploads') {
        const fileName = `${domain}/${folder}/${Date.now()}-${file.originalname}`;
        await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        return fileName;
    }
    async getFileUrl(fileName, expirySeconds = 24 * 60 * 60) {
        return this.minioClient.presignedGetObject(this.bucketName, fileName, expirySeconds);
    }
    async deleteFile(fileName) {
        await this.minioClient.removeObject(this.bucketName, fileName);
    }
    async getFile(fileName) {
        const stream = await this.minioClient.getObject(this.bucketName, fileName);
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
    async listFiles(prefix = '', recursive = true) {
        const stream = this.minioClient.listObjectsV2(this.bucketName, prefix, recursive);
        const files = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (obj) => files.push(obj));
            stream.on('end', () => resolve(files));
            stream.on('error', (err) => reject(err));
        });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map