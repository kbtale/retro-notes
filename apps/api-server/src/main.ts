import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application running on port ${port}`);
}
bootstrap();