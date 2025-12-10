import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotImage } from './entities/robot-image.entity';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(RobotImage)
        private imagesRepository: Repository<RobotImage>,
        private storageService: StorageService,
    ) { }

    async findAll(domain: string): Promise<RobotImage[]> {
        return this.imagesRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<RobotImage> {
        return this.imagesRepository.findOne({ where: { id } });
    }

    async create(
        site: string,
        imageType: string,
        domain: string,
        file: Express.Multer.File,
    ): Promise<RobotImage> {
        const imageUrl = await this.storageService.uploadFile(file, domain, 'images');

        const image = this.imagesRepository.create({
            site,
            imageType,
            domain,
            imageUrl,
        });

        return this.imagesRepository.save(image);
    }

    async update(
        id: string,
        updateData: { site?: string; imageType?: string },
        file?: Express.Multer.File,
    ): Promise<RobotImage> {
        const image = await this.findOne(id);

        if (file) {
            if (image.imageUrl) {
                await this.storageService.deleteFile(image.imageUrl);
            }
            image.imageUrl = await this.storageService.uploadFile(file, image.domain, 'images');
        }

        Object.assign(image, updateData);
        return this.imagesRepository.save(image);
    }

    async delete(id: string): Promise<void> {
        const image = await this.findOne(id);

        if (image.imageUrl) {
            await this.storageService.deleteFile(image.imageUrl);
        }

        await this.imagesRepository.delete(id);
    }
}
