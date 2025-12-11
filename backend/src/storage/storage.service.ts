import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;
    private endpoint: string;
    private useSSL: boolean;

    constructor(private configService: ConfigService) {
        this.endpoint = this.configService.get('MINIO_ENDPOINT') || 'localhost';
        const accessKey = this.configService.get('MINIO_ACCESS_KEY');
        const secretKey = this.configService.get('MINIO_SECRET_KEY');
        this.useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'report';
        
        // Get port from config or use default based on SSL
        const port = this.configService.get('MINIO_PORT') 
            ? parseInt(this.configService.get('MINIO_PORT')) 
            : (this.useSSL ? 443 : 9000);

        // Initialize MinIO client
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
            // Check if bucket exists
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            
            if (!bucketExists) {
                console.log(`📦 Bucket '${this.bucketName}' does not exist, creating...`);
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`✅ Bucket '${this.bucketName}' created successfully`);
            } else {
                console.log(`✅ MinIO connected successfully - Bucket '${this.bucketName}' exists`);
            }
        } catch (error) {
            console.error('❌ MinIO connection failed:', error.message);
            // Don't throw error, allow app to start even if MinIO is down
            console.warn('⚠️  MinIO connection failed, but service will continue...');
        }
    }

    /**
     * Get presigned URL for file access (expires in 7 days by default)
     */
    async getFileUrl(fileName: string, expirySeconds: number = 604800): Promise<string> {
        try {
            const url = await this.minioClient.presignedGetObject(
                this.bucketName,
                fileName,
                expirySeconds
            );
            console.log(`✅ Generated presigned URL for: ${fileName}`);
            return url;
        } catch (error) {
            console.error(`❌ Get file URL failed: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * List objects in MinIO with prefix
     * Returns both files and folders
     */
    async listObjects(prefix: string = ''): Promise<Array<{ 
        name: string; 
        size: number; 
        lastModified: Date; 
        isDir: boolean;
    }>> {
        try {
            // Normalize prefix - ensure it ends with / if not empty
            const normalizedPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;
            console.log(`📋 Listing objects with prefix: '${normalizedPrefix}'`);

            const objects: Array<{ name: string; size: number; lastModified: Date; isDir: boolean }> = [];
            const seenPrefixes = new Set<string>();

            // List with recursive: false to get immediate children only
            const stream = this.minioClient.listObjects(this.bucketName, normalizedPrefix, false);

            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => {
                    // Handle folders (prefixes)
                    if (obj.prefix && !seenPrefixes.has(obj.prefix)) {
                        seenPrefixes.add(obj.prefix);
                        objects.push({
                            name: obj.prefix,
                            size: 0,
                            lastModified: new Date(),
                            isDir: true,
                        });
                    }
                    
                    // Handle files (skip the prefix itself if it's returned as a file)
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
        } catch (error) {
            console.error(`❌ List objects error:`, error);
            throw error;
        }
    }

    /**
     * Upload file to MinIO
     */
    async uploadFile(
        file: Express.Multer.File,
        domain: string,
        folder: string = 'uploads',
    ): Promise<string> {
        try {
            const fileName = `${domain}/${folder}/${Date.now()}-${file.originalname}`;
            
            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                file.buffer,
                file.size,
                {
                    'Content-Type': file.mimetype,
                }
            );

            console.log(`✅ File uploaded successfully: ${fileName}`);
            return fileName;
        } catch (error) {
            console.error(`❌ File upload failed:`, error);
            throw error;
        }
    }

    /**
     * Delete file from MinIO
     */
    async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
            console.log(`✅ File deleted successfully: ${fileName}`);
        } catch (error) {
            console.error(`❌ File deletion failed: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Get file as stream (for direct download)
     */
    async getFile(fileName: string): Promise<Buffer> {
        try {
            const dataStream = await this.minioClient.getObject(this.bucketName, fileName);
            
            return new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                dataStream.on('data', (chunk) => chunks.push(chunk));
                dataStream.on('end', () => resolve(Buffer.concat(chunks)));
                dataStream.on('error', reject);
            });
        } catch (error) {
            console.error(`❌ Get file failed: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Download file with metadata (for streaming to response)
     */
    async downloadFile(fileName: string): Promise<{ 
        stream: any; 
        size: number; 
        contentType: string;
        etag?: string;
    }> {
        try {
            const stat = await this.minioClient.statObject(this.bucketName, fileName);
            const stream = await this.minioClient.getObject(this.bucketName, fileName);
            
            return {
                stream,
                size: stat.size,
                contentType: stat.metaData['content-type'] || 'application/octet-stream',
                etag: stat.etag,
            };
        } catch (error) {
            console.error(`❌ Download file failed: ${fileName}`, error);
            throw error;
        }
    }
}