import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApplicationExceptionFilter } from './shared/infrastructure/filters/application-exception.filter';
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new ApplicationExceptionFilter(), new DomainExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clean Shop API')
    .setDescription('Clean Architecture, DDD and CQRS E-Commerce REST API')
    .setVersion('1.0')
    .addTag('customers', 'Customer management operations')
    .addTag('products', 'Product catalog operations')
    .addTag('orders', 'Order placement and lifecycle management')
    .addTag('payments', 'Payment processing and Stripe webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
