import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn', 'log', 'debug', 'verbose']
    });
    
    // Configure CORS for production
    const allowedOrigins = [
      'https://study-buddy-frontend-zeta.vercel.app',    // Production frontend
      'http://localhost:3000',                           // Local development frontend
    ];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    });

    // Remove any global prefix
    app.setGlobalPrefix('');

    // Configure JSON body parser with increased limits
    app.use(json({ limit: '50mb' }));

    // Use global validation pipe with more permissive settings
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        disableErrorMessages: false,
      }),
    );

    // Get port from environment with fallback
    const port = process.env.PORT || 8000;
    
    // Listen on all network interfaces
    await app.listen(port, '0.0.0.0');
    
    const serverUrl = await app.getUrl();
    console.log(`Application is running on: ${serverUrl}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS enabled for all origins (temporary)`);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err);
  process.exit(1);
});
