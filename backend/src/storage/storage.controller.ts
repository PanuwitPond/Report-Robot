import { Controller, Get, Query } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Get('url')
    async getFileUrl(@Query('path') path: string) {
        const url = await this.storageService.getFileUrl(path);
        return { url };
    }
}
