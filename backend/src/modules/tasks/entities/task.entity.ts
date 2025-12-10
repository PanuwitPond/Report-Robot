import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column()
    taskName: string;

    @Column()
    mapName: string;

    @Column()
    mode: string;

    @Column()
    purpose: string;

    @Column()
    siteName: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'enum', enum: ['METTBOT', 'METTPOLE'] })
    domain: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
