import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the specific frontend domain
  app.enableCors({
    origin: [
      'https://study-buddy-frontend-zeta.vercel.app',
      'http://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // Configure JSON body parser to accept larger payloads
  app.use(json({ limit: '5mb' }));

  // Use global validation pipe with transformation enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: false, // Allow unknown properties
      forbidNonWhitelisted: false, // Don't throw errors for unknown properties
      enableDebugMessages: true,
    }),
  );

  await app.listen(8000);
  console.log('Application is running on port 8000');
}
bootstrap();
