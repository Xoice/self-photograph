import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

const DEFAULT_JWT_SECRETS = ['dev-secret-key', 'dev-secret-key-change-in-production'];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === 'production' && DEFAULT_JWT_SECRETS.includes(process.env.JWT_SECRET || '')) {
    console.error('FATAL: JWT_SECRET is using a default value. Set a secure JWT_SECRET in production.');
    process.exit(1);
  }

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
    maxAge: '7d',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
