import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  // To ustawienie wita naszego "zwiadowcę" i wpuszcza go do środka
  app.enableCors({
    origin: 'http://localhost:3000', 
    credentials: true,
  });

  await app.listen(3002);
}
bootstrap();