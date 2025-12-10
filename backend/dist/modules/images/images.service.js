"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const robot_image_entity_1 = require("./entities/robot-image.entity");
const storage_service_1 = require("../../storage/storage.service");
let ImagesService = class ImagesService {
    constructor(imagesRepository, storageService) {
        this.imagesRepository = imagesRepository;
        this.storageService = storageService;
    }
    async findAll(domain) {
        return this.imagesRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.imagesRepository.findOne({ where: { id } });
    }
    async create(site, imageType, domain, file) {
        const imageUrl = await this.storageService.uploadFile(file, domain, 'images');
        const image = this.imagesRepository.create({
            site,
            imageType,
            domain,
            imageUrl,
        });
        return this.imagesRepository.save(image);
    }
    async update(id, updateData, file) {
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
    async delete(id) {
        const image = await this.findOne(id);
        if (image.imageUrl) {
            await this.storageService.deleteFile(image.imageUrl);
        }
        await this.imagesRepository.delete(id);
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(robot_image_entity_1.RobotImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], ImagesService);
//# sourceMappingURL=images.service.js.map