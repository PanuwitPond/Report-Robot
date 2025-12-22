import { Injectable, Inject, Logger } from '@nestjs/common';
import { RobotRepository } from './repositories/robot.repository';
import { RobotDto, CreateRobotDto, UpdateRobotDto } from './dtos/robot.dto';
import { ResourceNotFoundException, ResourceConflictException } from '@/shared/types';

@Injectable()
export class RobotsService {
    private readonly logger = new Logger(RobotsService.name);
    
    constructor(
        @Inject('ROBOT_REPOSITORY')
        private robotRepository: RobotRepository,
    ) {}

    /**
     * Get all robots
     */
    async findAll(): Promise<RobotDto[]> {
        this.logger.log('findAll() called');
        try {
            // Temporary fallback for debugging
            this.logger.log('robotRepository instance:', this.robotRepository?.constructor?.name);
            
            const robots = await this.robotRepository.findAll();
            this.logger.log(`Found ${robots.length} robots`);
            return robots.map(robot => new RobotDto(robot));
        } catch (error) {
            this.logger.error('Error in findAll:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '');
            // Return empty array as fallback
            this.logger.log('Returning empty array as fallback');
            return [];
        }
    }

    /**
     * Get robots with pagination
     */
    async findAllPaginated(
        limit: number = 10,
        offset: number = 0,
        filters?: { name?: string; status?: string; is_active?: boolean },
    ) {
        return this.robotRepository.findAllPaginated(limit, offset, filters);
    }

    /**
     * Get single robot by ID
     */
    async findOne(id: string | number): Promise<RobotDto> {
        const robot = await this.robotRepository.findById(id);
        if (!robot) {
            throw new ResourceNotFoundException('Robot', String(id));
        }
        return new RobotDto(robot);
    }

    /**
     * Get robot by VIN
     */
    async findByVin(vin: string): Promise<RobotDto | null> {
        const robot = await this.robotRepository.findByVin(vin);
        return robot ? new RobotDto(robot) : null;
    }

    /**
     * Create new robot
     */
    async create(createRobotDto: CreateRobotDto): Promise<RobotDto> {
        // Check if VIN already exists
        const existing = await this.robotRepository.findByVin(createRobotDto.vin);
        if (existing) {
            throw new ResourceConflictException('Robot', 'vin', createRobotDto.vin);
        }

        const robot = await this.robotRepository.create({
            vin: createRobotDto.vin,
            name: createRobotDto.name,
            display_name: createRobotDto.display_name,
            workspace_id: createRobotDto.workspace_id,
            site: createRobotDto.site,
            active: createRobotDto.active ?? true,
        });

        return new RobotDto(robot);
    }

    /**
     * Update robot
     */
    async update(id: string | number, updateRobotDto: UpdateRobotDto): Promise<RobotDto> {
        const robot = await this.robotRepository.findById(id);
        if (!robot) {
            throw new ResourceNotFoundException('Robot', String(id));
        }

        const updated = await this.robotRepository.update(id, {
            name: updateRobotDto.name,
            display_name: updateRobotDto.display_name,
            workspace_id: updateRobotDto.workspace_id,
            site: updateRobotDto.site,
            active: updateRobotDto.active,
        });

        return new RobotDto(updated);
    }

    /**
     * Delete robot (soft delete)
     */
    async delete(id: string | number): Promise<{ message: string }> {
        const exists = await this.robotRepository.exists(id);
        if (!exists) {
            throw new ResourceNotFoundException('Robot', String(id));
        }

        await this.robotRepository.delete(id);
        return { message: 'Robot deleted successfully' };
    }

    /**
     * Delete robot by VIN
     */
    async deleteByVin(vin: string): Promise<{ message: string }> {
        const success = await this.robotRepository.deleteByVin(vin);
        if (!success) {
            throw new ResourceNotFoundException('Robot', vin);
        }
        return { message: 'Robot deleted successfully' };
    }

    /**
     * Get robot statistics
     */
    async getStatistics() {
        return this.robotRepository.getStatistics();
    }

    /**
     * Get all active robots
     */
    async findAllActive(): Promise<RobotDto[]> {
        const robots = await this.robotRepository.findAllActive();
        return robots.map(robot => new RobotDto(robot));
    }

    /**
     * Count robots
     */
    async count(): Promise<number> {
        return this.robotRepository.count();
    }
}