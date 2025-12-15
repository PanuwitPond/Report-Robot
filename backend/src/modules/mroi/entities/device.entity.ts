import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { RoiEntity } from './roi.entity';
import { ScheduleEntity } from './schedule.entity';

@Entity('mroi_devices')
export class DeviceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500 })
    rtspUrl: string;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status: 'active' | 'inactive' | 'disconnected';

    @Column({ type: 'varchar', length: 100, nullable: true })
    location: string;

    @Column({ type: 'jsonb', nullable: true })
    cameraSettings: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };

    @Column({ type: 'uuid' })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar', length: 50, default: 'default-domain' })
    domain: string;

    // Relations
    @OneToMany(() => RoiEntity, (roi) => roi.device, { cascade: true })
    rois: RoiEntity[];

    @OneToMany(() => ScheduleEntity, (schedule) => schedule.device, { cascade: true })
    schedules: ScheduleEntity[];
}
