import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    console.log('---------------------------------');
    console.log('🚀 BOOTSTRAP STARTING...');
    console.log('DEBUG ENV VARIABLES:');
    console.log('DB Host 1:', process.env.DATABASE_HOST);
    console.log('DB Host 2:', process.env.MIOC_DB_HOST);
    console.log('MROI DB Host:', process.env.MROI_DB_HOST);
    console.log('---------------------------------');
    
    console.log('📦 Creating NestFactory app...');
    const startTime = Date.now();
    const app = await NestFactory.create(AppModule);
    const createTime = Date.now() - startTime;
    console.log(`✅ NestFactory.create() completed in ${createTime}ms`);

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

    const port = process.env.PORT || 3001;
    console.log(`⏳ Starting app.listen(${port})...`);
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
    console.log(`✅ BOOTSTRAP COMPLETE`);
}

bootstrap();
