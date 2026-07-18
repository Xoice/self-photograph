import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async submitContact(data: {
    name: string;
    email: string;
    message: string;
    sourcePage?: string;
  }) {
    const lead = await this.prisma.contactLead.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
        sourcePage: data.sourcePage,
      },
    });
    return { id: lead.id };
  }

  async submitEnrollment(data: {
    workshopSlug: string;
    name: string;
    phone: string;
    wechat: string;
    email: string;
    message?: string;
  }) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { slug: data.workshopSlug },
    });
    if (!workshop) {
      throw new NotFoundException('活动不存在');
    }

    // 容量检查 + 创建 + 计数自增放在同一交互式事务内，避免 TOCTOU 超卖
    const enrollment = await this.prisma.$transaction(async (tx) => {
      const fresh = await tx.workshop.findUnique({ where: { id: workshop.id } });
      if (fresh?.capacity && (fresh.enrolledCount >= fresh.capacity)) {
        throw new BadRequestException('该活动已满员');
      }
      const created = await tx.workshopEnrollment.create({
        data: {
          workshopId: workshop.id,
          name: data.name,
          phone: data.phone,
          wechat: data.wechat,
          email: data.email,
          message: data.message,
        },
      });
      await tx.workshop.update({
        where: { id: workshop.id },
        data: { enrolledCount: { increment: 1 } },
      });
      return created;
    });

    return { id: enrollment.id };
  }

  async getContactLeads(query: { page?: number; pageSize?: number; status?: string; keyword?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContactLeadWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { email: { contains: query.keyword } },
        { message: { contains: query.keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.contactLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.contactLead.count({ where }),
    ]);

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async updateContactLeadStatus(id: string, status: string) {
    return this.prisma.contactLead.update({ where: { id }, data: { status } });
  }

  async deleteContactLead(id: string) {
    return this.prisma.contactLead.delete({ where: { id } });
  }

  async getEnrollments(query: { page?: number; pageSize?: number }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.workshopEnrollment.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.workshopEnrollment.count(),
    ]);

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }
}
