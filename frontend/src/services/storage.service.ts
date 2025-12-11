// storageService.ts - Frontend API client
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface StorageObject {
    name: string;
    size: number;
    lastModified: Date;
    isDir: boolean;
}

export interface ListObjectsResponse {
    success: boolean;
    prefix: string;
    objects: StorageObject[];
}

class StorageService {
    private axiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });
    }

    /**
     * List objects in a folder
     */
    async listObjects(prefix: string = ''): Promise<StorageObject[]> {
        try {
            const response = await this.axiosInstance.get<ListObjectsResponse>(
                '/storage/objects',
                {
                    params: { prefix },
                }
            );

            if (response.data.success) {
                return response.data.objects;
            } else {
                throw new Error('Failed to list objects');
            }
        } catch (error: any) {
            console.error('List objects error:', error);
            throw new Error(error.response?.data?.message || 'Failed to list objects');
        }
    }

    /**
     * Download a file
     */
    async downloadFile(fileName: string): Promise<void> {
        try {
            // Create download link that triggers browser download
            const downloadUrl = `${API_BASE_URL}/storage/download?path=${encodeURIComponent(fileName)}`;
            
            // Open in new tab or trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName.split('/').pop() || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Download started:', fileName);
        } catch (error: any) {
            console.error('Download error:', error);
            throw new Error('Failed to download file');
        }
    }

    /**
     * Get presigned URL for a file
     */
    async getFileUrl(fileName: string): Promise<string> {
        try {
            const response = await this.axiosInstance.get('/storage/url', {
                params: { path: fileName },
            });

            if (response.data.url) {
                return response.data.url;
            } else {
                throw new Error('Failed to get file URL');
            }
        } catch (error: any) {
            console.error('Get file URL error:', error);
            throw new Error(error.response?.data?.message || 'Failed to get file URL');
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(fileName: string): Promise<void> {
        try {
            const response = await this.axiosInstance.get('/storage/delete', {
                params: { path: fileName },
            });

            if (!response.data.success) {
                throw new Error('Failed to delete file');
            }

            console.log('✅ File deleted:', fileName);
        } catch (error: any) {
            console.error('Delete error:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete file');
        }
    }
}

export const storageService = new StorageService();