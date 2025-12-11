import { 
    Controller, 
    Get, 
    Query, 
    Req, 
    Res,
    HttpException,
    HttpStatus 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    /**
     * Get presigned URL or redirect to file
     * GET /storage/url?path=mettpole/dad/file.pdf
     */
    @Get('url')
    async getFileUrl(
        @Query('path') path: string, 
        @Req() req: Request, 
        @Res() res: Response
    ) {
        try {
            if (!path) {
                throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
            }

            const url = await this.storageService.getFileUrl(path);

            // If the request likely comes from a browser <img> (accepts images), redirect
            const accept = req.headers['accept'] || '';
            if (typeof accept === 'string' && accept.includes('image')) {
                return res.redirect(url);
            }

            // Otherwise return JSON (used by XHR/fetch/axios)
            return res.json({ url });
        } catch (error) {
            console.error('Get URL error:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to get file URL',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * List objects in a folder
     * GET /storage/objects?prefix=mettpole/dad/
     */
    @Get('objects')
    async listObjects(@Query('prefix') prefix: string = '') {
        try {
            const objects = await this.storageService.listObjects(prefix);
            return { 
                success: true,
                prefix, 
                objects 
            };
        } catch (error) {
            console.error('List objects error:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to list objects',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Download a file directly (streams the file)
     * GET /storage/download?path=mettpole/dad/report.pdf
     */
    @Get('download')
    async downloadFile(
        @Query('path') path: string,
        @Res() res: Response,
    ) {
        try {
            if (!path) {
                throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
            }

            const { stream, size, contentType } = await this.storageService.downloadFile(path);

            // Extract filename from path
            const displayName = path.split('/').pop() || 'download';

            // Set headers for download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', size);
            res.setHeader('Content-Disposition', `attachment; filename="${displayName}"`);

            // Pipe the stream to response
            stream.pipe(res);
        } catch (error) {
            console.error('Download error:', error);
            
            // If headers not sent yet, send error response
            if (!res.headersSent) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to download file',
                    error: error.message,
                });
            }
        }
    }

    /**
     * Delete a file
     * GET /storage/delete?path=mettpole/dad/report.pdf
     * (Note: Should be DELETE method in production)
     */
    @Get('delete')
    async deleteFile(@Query('path') path: string) {
        try {
            if (!path) {
                throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
            }

            await this.storageService.deleteFile(path);
            return {
                success: true,
                message: 'File deleted successfully',
                path: path,
            };
        } catch (error) {
            console.error('Delete error:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to delete file',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}