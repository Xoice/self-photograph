import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkshopsService {
  constructor(private prisma: PrismaService) {}

  // tags 以 JSON 字符串存储（SQLite 不支持原生 String[]），对外返回数组
  private parseTags(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }

  async getWorkshops(query: {
    page?: number;
    pageSize?: number;
    featured?: string;
    status?: string;
    keyword?: string;
    includeUnpublished?: string;
  }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.WorkshopWhereInput = {};
    if (query.includeUnpublished !== 'true') where.isPublished = true;
    if (query.featured === 'true') where.isFeatured = true;
    if (query.status) where.status = query.status;
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword } },
        { summary: { contains: query.keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.workshop.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.workshop.count({ where }),
    ]);

    return {
      items: items.map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        subtitle: w.subtitle,
        summary: w.summary,
        content: w.content,
        coverImage: w.coverImage,
        priceText: w.priceText,
        location: w.location,
        startDate: w.startDate?.toISOString(),
        endDate: w.endDate?.toISOString(),
        capacity: w.capacity,
        enrolledCount: w.enrolledCount,
        level: w.level,
        durationText: w.durationText,
        status: w.status,
        isFeatured: w.isFeatured,
        isPublished: w.isPublished,
        sortOrder: w.sortOrder,
        tags: this.parseTags(w.tags),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getWorkshopBySlug(slug: string, includeUnpublished = false) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { slug },
      include: {
        highlights: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { dayIndex: 'asc' } },
        feeItems: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!workshop) throw new NotFoundException('活动不存在');
    if (!includeUnpublished && !workshop.isPublished) throw new NotFoundException('活动不存在');

    const siteConfig = await this.prisma.siteConfig.findFirst();

    const feeIncludes = workshop.feeItems.filter((f) => f.type === 'included').map((f) => f.content);
    const feeExcludes = workshop.feeItems.filter((f) => f.type === 'excluded').map((f) => f.content);

    return {
      id: workshop.id,
      title: workshop.title,
      slug: workshop.slug,
      subtitle: workshop.subtitle,
      summary: workshop.summary,
      content: workshop.content,
      coverImage: workshop.coverImage,
      priceText: workshop.priceText,
      location: workshop.location,
      startDate: workshop.startDate?.toISOString(),
      endDate: workshop.endDate?.toISOString(),
      capacity: workshop.capacity,
      enrolledCount: workshop.enrolledCount,
      level: workshop.level,
      durationText: workshop.durationText,
      status: workshop.status,
      isFeatured: workshop.isFeatured,
      tags: this.parseTags(workshop.tags),
      highlights: workshop.highlights.map((h) => ({
        title: h.title,
        content: h.content,
      })),
      itinerary: workshop.itinerary.map((d) => ({
        dayIndex: d.dayIndex,
        title: d.title,
        content: d.content,
      })),
      feeIncludes,
      feeExcludes,
      contact: {
        phone: siteConfig?.contactPhone || '',
        email: siteConfig?.contactEmail || '',
        wechat: siteConfig?.contactWechat || '',
        location: workshop.location || siteConfig?.locationText || '',
      },
    };
  }

  async createWorkshop(data: Omit<Prisma.WorkshopCreateInput, 'tags'> & { tags?: string[] }) {
    const existing = await this.prisma.workshop.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('slug 已存在');
    // tags 数组序列化为 JSON 字符串存储
    const { tags, ...rest } = data;
    return this.prisma.workshop.create({ data: { ...rest, tags: JSON.stringify(tags ?? []) } });
  }

  async updateWorkshop(id: string, data: Omit<Prisma.WorkshopUpdateInput, 'tags'> & { tags?: string[] }) {
    const { tags, ...rest } = data;
    const payload: Prisma.WorkshopUpdateInput = { ...rest };
    if (tags !== undefined) payload.tags = JSON.stringify(tags ?? []);
    try {
      return await this.prisma.workshop.update({ where: { id }, data: payload });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('活动不存在');
      }
      throw e;
    }
  }

  async deleteWorkshop(id: string) {
    try {
      return await this.prisma.workshop.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('活动不存在');
      }
      throw e;
    }
  }

  async getWorkshopById(id: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      include: {
        highlights: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { dayIndex: 'asc' } },
        feeItems: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!workshop) throw new NotFoundException('活动不存在');

    return {
      id: workshop.id,
      title: workshop.title,
      slug: workshop.slug,
      subtitle: workshop.subtitle,
      summary: workshop.summary,
      content: workshop.content,
      coverImage: workshop.coverImage,
      priceText: workshop.priceText,
      priceCents: workshop.priceCents,
      location: workshop.location,
      startDate: workshop.startDate?.toISOString(),
      endDate: workshop.endDate?.toISOString(),
      capacity: workshop.capacity,
      enrolledCount: workshop.enrolledCount,
      level: workshop.level,
      durationText: workshop.durationText,
      status: workshop.status,
      isFeatured: workshop.isFeatured,
      isPublished: workshop.isPublished,
      sortOrder: workshop.sortOrder,
      highlights: workshop.highlights.map((h) => ({
        id: h.id,
        title: h.title,
        content: h.content,
        sortOrder: h.sortOrder,
      })),
      itinerary: workshop.itinerary.map((d) => ({
        id: d.id,
        dayIndex: d.dayIndex,
        title: d.title,
        content: d.content,
        sortOrder: d.sortOrder,
      })),
      feeItems: workshop.feeItems.map((f) => ({
        id: f.id,
        type: f.type,
        content: f.content,
        sortOrder: f.sortOrder,
      })),
      tags: this.parseTags(workshop.tags),
    };
  }

  async addHighlight(workshopId: string, data: { title: string; content: string; sortOrder?: number }) {
    return this.prisma.workshopHighlight.create({
      data: { workshopId, title: data.title, content: data.content, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async updateHighlight(workshopId: string, id: string, data: { title?: string; content?: string; sortOrder?: number }) {
    const existing = await this.prisma.workshopHighlight.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('亮点不存在');
    try {
      return await this.prisma.workshopHighlight.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('亮点不存在');
      }
      throw e;
    }
  }

  async deleteHighlight(workshopId: string, id: string) {
    const existing = await this.prisma.workshopHighlight.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('亮点不存在');
    try {
      return await this.prisma.workshopHighlight.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('亮点不存在');
      }
      throw e;
    }
  }

  async addItinerary(workshopId: string, data: { dayIndex: number; title: string; content: string; sortOrder?: number }) {
    return this.prisma.workshopItinerary.create({
      data: { workshopId, dayIndex: data.dayIndex, title: data.title, content: data.content, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async updateItinerary(workshopId: string, id: string, data: { dayIndex?: number; title?: string; content?: string; sortOrder?: number }) {
    const existing = await this.prisma.workshopItinerary.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('行程不存在');
    try {
      return await this.prisma.workshopItinerary.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('行程不存在');
      }
      throw e;
    }
  }

  async deleteItinerary(workshopId: string, id: string) {
    const existing = await this.prisma.workshopItinerary.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('行程不存在');
    try {
      return await this.prisma.workshopItinerary.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('行程不存在');
      }
      throw e;
    }
  }

  async addFeeItem(workshopId: string, data: { type: string; content: string; sortOrder?: number }) {
    return this.prisma.workshopFeeItem.create({
      data: { workshopId, type: data.type, content: data.content, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async updateFeeItem(workshopId: string, id: string, data: { type?: string; content?: string; sortOrder?: number }) {
    const existing = await this.prisma.workshopFeeItem.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('费用项不存在');
    try {
      return await this.prisma.workshopFeeItem.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('费用项不存在');
      }
      throw e;
    }
  }

  async deleteFeeItem(workshopId: string, id: string) {
    const existing = await this.prisma.workshopFeeItem.findFirst({ where: { id, workshopId } });
    if (!existing) throw new NotFoundException('费用项不存在');
    try {
      return await this.prisma.workshopFeeItem.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('费用项不存在');
      }
      throw e;
    }
  }
}
