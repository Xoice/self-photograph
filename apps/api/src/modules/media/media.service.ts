import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { join } from 'path';
import { existsSync, unlinkSync, openSync, readSync, closeSync } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId?: string, customName?: string) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('仅支持图片文件');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    // Multer 不会填充宽高，这里从磁盘文件头解析（避免引入 sharp 依赖）
    const dimensions = readImageDimensions(file.path);

    const media = await this.prisma.mediaAsset.create({
      data: {
        fileName: customName || file.originalname,
        fileType: file.mimetype.split('/')[1] || 'unknown',
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
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

  async getMediaList(query: { page?: number; pageSize?: number; type?: string; q?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MediaAssetWhereInput = {};
    if (query.type) {
      where.fileType = query.type;
    }
    if (query.q) {
      where.fileName = { contains: query.q };
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

  async renameMedia(id: string, fileName: string) {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!media) {
      throw new BadRequestException('文件不存在');
    }
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { fileName },
    });
  }

  async deleteMedia(id: string) {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!media) {
      throw new BadRequestException('文件不存在');
    }
    // 同步删除磁盘源文件，避免孤儿文件累积
    if (media.url?.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), media.url);
      try {
        if (existsSync(filePath)) unlinkSync(filePath);
      } catch {
        // 删盘失败不阻断数据库删除流程
      }
    }
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}

// 从图片文件头解析宽高（支持 PNG / JPEG / GIF / WebP），无需外部依赖
function readImageDimensions(filePath: string): { width: number; height: number } | null {
  let fd: number | undefined;
  try {
    fd = openSync(filePath, 'r');
    const buf = Buffer.alloc(65536);
    const bytesRead = readSync(fd, buf, 0, buf.length, 0);
    return parseImageDimensions(buf.subarray(0, bytesRead));
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export function parseImageDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;

  // PNG: 89 50 4E 47 ...
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: FFD8，需扫描 SOF0/SOF2 段
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 1) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      // SOF0 / SOF1 / SOF2 ... SOF15 (不含 RSTn / TEM)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        if (height && width) return { width, height };
        return null;
      }
      const segLen = buf.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    }
    return null;
  }

  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP: RIFF....WEBP
  if (
    buf.length > 30 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    // VP8X（extended）/ VP8L（lossless）/ VP8（lossy）
    const fourcc = buf.toString('ascii', 12, 16);
    if (fourcc === 'VP8X') {
      return { width: (buf.readUIntLE(24, 3) & 0xffffff) + 1, height: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    }
    if (fourcc === 'VP8L') {
      const b0 = buf.readUInt8(21);
      const b1 = buf.readUInt8(22);
      const b2 = buf.readUInt8(23);
      const b3 = buf.readUInt8(24);
      return { width: 1 + ((b1 & 0x3f) << 8 | b0), height: 1 + ((b3 & 0x0f) << 10 | b2 << 2 | (b1 & 0xc0) >> 6) };
    }
    if (fourcc === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
  }

  return null;
}
