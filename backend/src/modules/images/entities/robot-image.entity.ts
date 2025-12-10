import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('robot_images')
export class RobotImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    site: string;

    @Column()
    imageType: string;

    @Column()
    imageUrl: string;

    @Column({ type: 'enum', enum: ['METTBOT', 'METTPOLE'] })
    domain: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
