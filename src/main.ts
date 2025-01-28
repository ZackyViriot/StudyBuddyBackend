import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://study-buddy-frontend-zeta.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Configure JSON body parser to accept larger payloads
  app.use(json({ limit: '5mb' }));
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
