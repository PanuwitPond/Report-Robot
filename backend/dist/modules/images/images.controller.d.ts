import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly imagesService;
    constructor(imagesService: ImagesService);
    findAll(domain: string): Promise<import("./entities/robot-image.entity").RobotImage[]>;
    findOne(id: string): Promise<import("./entities/robot-image.entity").RobotImage>;
    create(site: string, imageType: string, domain: string, file: Express.Multer.File): Promise<import("./entities/robot-image.entity").RobotImage>;
    update(id: string, updateData: {
        site?: string;
        imageType?: string;
    }, file: Express.Multer.File): Promise<import("./entities/robot-image.entity").RobotImage>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
