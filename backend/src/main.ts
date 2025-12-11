import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { seedDatabase } from './database/seed';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // Seed database with test data
    try {
        const dataSource = app.get(DataSource);
        if (dataSource && dataSource.isInitialized) {
            await seedDatabase(dataSource);
        }
    } catch (err) {
        console.warn('⚠️ Seed failed:', err?.message);
    }

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
