import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { MediaService } from './media.service';
import { AdminMediaController } from './admin-media.controller';

const uploadsDir = join(__dirname, '..', '..', '..', '..', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIMES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => {
          const ext = ALLOWED_MIMES[file.mimetype] || '.bin';
          cb(null, randomUUID() + ext);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES[file.mimetype]) {
          cb(new Error('仅支持 JPG/PNG/GIF/WebP 图片'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [AdminMediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
