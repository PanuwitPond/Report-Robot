import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Get('url')
    async getFileUrl(@Query('path') path: string, @Req() req: Request, @Res() res: Response) {
        const url = await this.storageService.getFileUrl(path);

        // If the request likely comes from a browser <img> (accepts images), redirect
        const accept = req.headers['accept'] || '';
        if (typeof accept === 'string' && accept.includes('image')) {
            return res.redirect(url);
        }

        // Otherwise return JSON (used by XHR/fetch/axios)
        return res.json({ url });
    }
}
