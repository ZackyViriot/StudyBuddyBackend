import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with more comprehensive configuration
  app.enableCors({
    origin: [
      'https://study-buddy-frontend-zeta.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ]
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
      whitelist: false,
      forbidNonWhitelisted: false,
      enableDebugMessages: true,
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
