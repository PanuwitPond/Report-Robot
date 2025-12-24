import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotImage } from './entities/robot-image.entity';
import { StorageService } from '../../storage/storage.service';
import { randomUUID } from 'crypto'; // Fix for randomUUID error
import * as path from 'path'; // Fix for path error

@Injectable()
export class ImagesService {
    constructor(
       @InjectRepository(RobotImage, 'ROBOT_CONNECTION')
        private readonly imagesRepository: Repository<RobotImage>,
        private readonly storageService: StorageService,
    ) { }

    async findAll(domain: string) {
        // 'domain' was not in RobotImage entity, filtered by site or removed if not applicable
        return this.imagesRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number) { // Changed id type from string to number to match entity
        const image = await this.imagesRepository.findOne({ where: { id } });
        if (!image) throw new NotFoundException('Image not found');
        return image;
    }

    async create(site: string, imageType: string, domain: string, file: Express.Multer.File) {
        const uuid = randomUUID();
        const fileExt = path.extname(file.originalname);
        const fileName = `operation_eqn/${uuid}${fileExt}`;

        // Fixed: storageService.uploadFile expects the file object, not just the buffer
        const imageUrl = await this.storageService.uploadFile(file, fileName);

        const newImage = this.imagesRepository.create({
            site,
            imageType,
            imageUrl: imageUrl, // Entity maps imageUrl to 'image_path'
            imageName: file.originalname,
        });
        return this.imagesRepository.save(newImage);
    }

    async delete(id: string) {
        const image = await this.findOne(Number(id));
        // Logic to delete from storage if necessary
        return this.imagesRepository.remove(image);
    }

    async update(id: number, updateData: { site?: string; imageType?: string }, file?: Express.Multer.File) {
    const image = await this.findOne(id);
    
    if (file) {
        const uuid = randomUUID();
        const fileExt = path.extname(file.originalname);
        const fileName = `operation_eqn/${uuid}${fileExt}`;
        image.imageUrl = await this.storageService.uploadFile(file, fileName);
    }

    Object.assign(image, updateData);
    return this.imagesRepository.save(image);
}
}