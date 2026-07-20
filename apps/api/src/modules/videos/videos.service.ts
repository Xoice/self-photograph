import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async getVideos(query: {
    page?: number;
    pageSize?: number;
    category?: string;
    publishedOnly?: boolean;
  }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 12;
    const skip = (page - 1) * pageSize;

    const where: Prisma.VideoWhereInput = {};
    if (query.publishedOnly !== false) where.isPublished = true;
    if (query.category) where.category = query.category;

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      items: items.map((v) => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        description: v.description,
        platform: v.platform,
        videoUrl: v.videoUrl,
        coverImage: v.coverImage,
        durationSeconds: v.durationSeconds,
        durationText: v.durationSeconds
          ? `${Math.floor(v.durationSeconds / 60)}:${String(v.durationSeconds % 60).padStart(2, '0')}`
          : null,
        category: v.category,
        isPublished: v.isPublished,
        publishedAt: v.publishedAt?.toISOString() || null,
        sortOrder: v.sortOrder,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createVideo(data: Prisma.VideoCreateInput) {
    const existing = await this.prisma.video.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('slug 已存在');
    if (data.isPublished === true) {
      data.publishedAt = new Date();
    }
    return this.prisma.video.create({ data });
  }

  async updateVideo(id: string, data: Prisma.VideoUpdateInput) {
    if (data.isPublished === true) {
      data.publishedAt = new Date();
    }
    try {
      return await this.prisma.video.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('视频不存在');
      }
      throw e;
    }
  }

  async deleteVideo(id: string) {
    try {
      return await this.prisma.video.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('视频不存在');
      }
      throw e;
    }
  }
}
