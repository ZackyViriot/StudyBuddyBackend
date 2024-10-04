import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   // Enable CORS for the specific frontend domain
   app.enableCors({
    origin: [
      'https://www.globalrecipebook.com','http://localhost:3000'

    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });
   // Use global validation pipe
   app.useGlobalPipes(new ValidationPipe());
  await app.listen(8000);
}
bootstrap();
