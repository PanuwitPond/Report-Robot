import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

    @Get()
    async findAll(@Query('domain') domain: string) {
        return this.imagesService.findAll(domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.imagesService.findOne(id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body('site') site: string,
        @Body('imageType') imageType: string,
        @Body('domain') domain: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.imagesService.create(site, imageType, domain, file);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() updateData: { site?: string; imageType?: string },
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.imagesService.update(id, updateData, file);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.imagesService.delete(id);
        return { message: 'Image deleted successfully' };
    }
}
