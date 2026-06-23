import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('仅支持图片文件');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    const media = await this.prisma.mediaAsset.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype.split('/')[1] || 'unknown',
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        width: (file as any).width || null,
        height: (file as any).height || null,
        sizeBytes: file.size,
        provider: 'local',
        createdBy: userId,
      },
    });

    return {
      id: media.id,
      url: media.url,
      fileName: media.fileName,
      width: media.width,
      height: media.height,
      sizeBytes: media.sizeBytes,
    };
  }

  async getMediaList(query: { page?: number; pageSize?: number; type?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.type) {
      where.fileType = query.type;
    }

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return {
      items: items.map((m) => ({
        id: m.id,
        url: m.url,
        fileName: m.fileName,
        fileType: m.fileType,
        mimeType: m.mimeType,
        width: m.width,
        height: m.height,
        sizeBytes: m.sizeBytes,
        createdAt: m.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async deleteMedia(id: string) {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!media) {
      throw new BadRequestException('文件不存在');
    }
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}
