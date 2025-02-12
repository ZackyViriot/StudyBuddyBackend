import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the specific frontend domain
  app.enableCors({
    origin: [
      'https://study-buddy-frontend-git-main-zackyviriots-projects.vercel.app',
      'https://study-buddy-frontend-zeta.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours in seconds
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Use global validation pipe with transformation enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(8000);
  console.log('Application is running on port 8000');
}
bootstrap();