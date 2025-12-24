import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'metthier', name: 'ml_robot_images' })
export class RobotImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  site: string;

  @Column({ name: 'image_type' })
  imageType: string;

  @Column({ name: 'image_name' })
  imageName: string;

  @Column({ name: 'image_path' }) // เก็บ URL/Path รูปภาพ
  imageUrl: string;

  @CreateDateColumn({ name: 'upload_date' })
  createdAt: Date;
}