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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("./storage.service");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async getFileUrl(path, req, res) {
        try {
            if (!path) {
                throw new common_1.HttpException('Path parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const url = await this.storageService.getFileUrl(path);
            const accept = req.headers['accept'] || '';
            if (typeof accept === 'string' && accept.includes('image')) {
                return res.redirect(url);
            }
            return res.json({ url });
        }
        catch (error) {
            console.error('Get URL error:', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get file URL',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listObjects(prefix = '') {
        try {
            const objects = await this.storageService.listObjects(prefix);
            return {
                success: true,
                prefix,
                objects
            };
        }
        catch (error) {
            console.error('List objects error:', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to list objects',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadFile(path, res) {
        try {
            if (!path) {
                throw new common_1.HttpException('Path parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const { stream, size, contentType } = await this.storageService.downloadFile(path);
            const displayName = path.split('/').pop() || 'download';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', size);
            res.setHeader('Content-Disposition', `attachment; filename="${displayName}"`);
            stream.pipe(res);
        }
        catch (error) {
            console.error('Download error:', error);
            if (!res.headersSent) {
                res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to download file',
                    error: error.message,
                });
            }
        }
    }
    async deleteFile(path) {
        try {
            if (!path) {
                throw new common_1.HttpException('Path parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.storageService.deleteFile(path);
            return {
                success: true,
                message: 'File deleted successfully',
                path: path,
            };
        }
        catch (error) {
            console.error('Delete error:', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to delete file',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)('url'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getFileUrl", null);
__decorate([
    (0, common_1.Get)('objects'),
    __param(0, (0, common_1.Query)('prefix')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "listObjects", null);
__decorate([
    (0, common_1.Get)('download'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('delete'),
    __param(0, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteFile", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map