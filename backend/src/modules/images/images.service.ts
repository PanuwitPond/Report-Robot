import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotImage } from './entities/robot-image.entity';
import { StorageService } from '../../storage/storage.service';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(RobotImage, 'ROBOT_CONNECTION')
        private readonly imagesRepository: Repository<RobotImage>,
        private readonly storageService: StorageService,
    ) { }

    async findAll(domain: string) {
        return this.imagesRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const image = await this.imagesRepository.findOne({ where: { id } });
        if (!image) throw new NotFoundException('Image not found');
        return image;
    }

    async create(site: string, imageType: string, domain: string, file: Express.Multer.File) {
        const uuid = randomUUID();
        const fileExt = path.extname(file.originalname);
        const fileName = `operation_eqn/${uuid}${fileExt}`; // Path เดิมของ robot-web

        // [แก้ตรงนี้] ใช้ uploadRobotFile เพื่อให้ลง Bucket 'robot' และได้ Full URL
        const imageUrl = await this.storageService.uploadRobotFile(file, fileName);

        const newImage = this.imagesRepository.create({
            site,
            imageType,
            imageUrl: imageUrl, // บันทึก Full URL (https://...)
            imageName: file.originalname,
        });
        return this.imagesRepository.save(newImage);
    }

    async update(id: number, updateData: { site?: string; imageType?: string }, file?: Express.Multer.File) {
        const image = await this.findOne(id);
        
        if (file) {
            const uuid = randomUUID();
            const fileExt = path.extname(file.originalname);
            const fileName = `operation_eqn/${uuid}${fileExt}`;
            
            // [แก้ตรงนี้] ใช้ uploadRobotFile เช่นกัน
            image.imageUrl = await this.storageService.uploadRobotFile(file, fileName);
        }

        Object.assign(image, updateData);
        return this.imagesRepository.save(image);
    }

    async delete(id: string) {
        const image = await this.findOne(Number(id));
        return this.imagesRepository.remove(image);
    }
}