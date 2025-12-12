import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    console.log('---------------------------------');
    console.log('DEBUG ENV VARIABLES:');
    console.log('DB Host 1:', process.env.DATABASE_HOST);
    console.log('DB Host 2:', process.env.MIOC_DB_HOST);
    console.log('---------------------------------');
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

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
