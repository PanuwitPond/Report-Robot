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

@Entity('mroi_rois')
export class RoiEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    type: 'intrusion' | 'tripwire' | 'density' | 'zoom';

    @Column({ type: 'uuid' })
    deviceId: string;

    @Column({ type: 'jsonb' })
    coordinates: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    settings: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'uuid' })
    createdBy: string;

    @Column({ type: 'varchar', length: 50, default: 'default-domain' })
    domain: string;

    // Relations
    @ManyToOne(() => DeviceEntity, (device) => device.rois, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deviceId' })
    device: DeviceEntity;
}
