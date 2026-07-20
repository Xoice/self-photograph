import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseTransformer } from './common/interceptors/response.transformer';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

const DEFAULT_JWT_SECRETS = ['dev-secret-key', 'dev-secret-key-change-in-production'];

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && DEFAULT_JWT_SECRETS.includes(process.env.JWT_SECRET || '')) {
    console.error('FATAL: JWT_SECRET is using a default value. Set a secure JWT_SECRET in production.');
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads',
    // 上传图片不变，缓存 7 天，减少首屏图片回源
    maxAge: '7d',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseTransformer());
  app.useGlobalFilters(new ApiExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
