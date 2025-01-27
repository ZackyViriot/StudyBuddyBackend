import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Configure JSON body parser to accept larger payloads
  app.use(json({ limit: '5mb' }));
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(8000);
}
bootstrap();
