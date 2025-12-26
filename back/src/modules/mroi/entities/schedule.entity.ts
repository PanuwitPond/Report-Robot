import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('mroi_schedules')
export class ScheduleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'uuid' })
    deviceId: string;

    @Column({ type: 'jsonb' })
    timeRange: {
        startTime: string; // HH:mm
        endTime: string; // HH:mm
    };

    @Column({ type: 'simple-array' })
    daysOfWeek: string[]; // ['MON', 'TUE', 'WED', ...]

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    actions: {
        enableROIs?: string[]; // ROI IDs
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'uuid' })
    createdBy: string;

    @Column({ type: 'varchar', length: 50, default: 'default-domain' })
    domain: string;

    // Relations
    @ManyToOne(() => DeviceEntity, (device) => device.schedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deviceId' })
    device: DeviceEntity;
}
