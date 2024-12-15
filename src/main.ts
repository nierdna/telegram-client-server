import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Telegram Client API')
    .setDescription('API documentation for Telegram Client Application')
    .setVersion('1.0')
    .addTag('telegram')
    .addTag('health')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  logger.log('Application is running on: http://localhost:3000');
  logger.log(
    "Swagger documentation is available at: http://localhost:3000/docs"
  );
}
bootstrap();