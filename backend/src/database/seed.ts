import { DataSource } from 'typeorm';
import { RobotImage } from '@/modules/images/entities/robot-image.entity';

export async function seedDatabase(dataSource: DataSource) {
    const robotImageRepository = dataSource.getRepository(RobotImage);

    // Check if test data already exists
    const existingCount = await robotImageRepository.count();
    if (existingCount > 0) {
        console.log('✅ Test data already exists, skipping seed');
        return;
    }

    // Create test robot images
    const testImages = [
        {
            site: 'Site A',
            imageType: 'Front View',
            domain: 'METTBOT',
            imageUrl: 'METTBOT/images/1733932800000-test-front.jpg',
        },
        {
            site: 'Site A',
            imageType: 'Side View',
            domain: 'METTBOT',
            imageUrl: 'METTBOT/images/1733932801000-test-side.jpg',
        },
        {
            site: 'Site B',
            imageType: 'Top View',
            domain: 'METTPOLE',
            imageUrl: 'METTPOLE/images/1733932802000-test-top.jpg',
        },
    ];

    await robotImageRepository.save(testImages);
    console.log(`✅ Seeded ${testImages.length} test images`);
}
