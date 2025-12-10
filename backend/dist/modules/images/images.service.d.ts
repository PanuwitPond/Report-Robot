import { Repository } from 'typeorm';
import { RobotImage } from './entities/robot-image.entity';
import { StorageService } from '@/storage/storage.service';
export declare class ImagesService {
    private imagesRepository;
    private storageService;
    constructor(imagesRepository: Repository<RobotImage>, storageService: StorageService);
    findAll(domain: string): Promise<RobotImage[]>;
    findOne(id: string): Promise<RobotImage>;
    create(site: string, imageType: string, domain: string, file: Express.Multer.File): Promise<RobotImage>;
    update(id: string, updateData: {
        site?: string;
        imageType?: string;
    }, file?: Express.Multer.File): Promise<RobotImage>;
    delete(id: string): Promise<void>;
}
