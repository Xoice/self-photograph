import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeHtml } from '../../common/utils/sanitize';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const config = await this.prisma.siteConfig.findFirst();
    if (!config) {
      throw new NotFoundException('站点配置不存在');
    }
    return {
      brandName: config.brandName,
      heroTitle: config.heroTitle,
      heroSubtitle: config.heroSubtitle,
      bioTitle: config.bioTitle,
      bioContent: config.bioContent,
      bioImage: config.bioImage,
      contact: {
        phone: config.contactPhone,
        email: config.contactEmail,
        wechat: config.contactWechat,
        location: config.locationText,
      },
      socialLinks: {
        bilibili: config.bilibiliUrl,
      },
      footerText: config.footerText,
    };
  }

  async updateConfig(data: {
    brandName?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    bioTitle?: string;
    bioContent?: string;
    bioImage?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactWechat?: string;
    locationText?: string;
    bilibiliUrl?: string;
    footerText?: string;
  }) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeHtml(value);
      } else {
        sanitized[key] = value;
      }
    }
    const existing = await this.prisma.siteConfig.findFirst();
    if (!existing) {
      return this.prisma.siteConfig.create({
        data: {
          brandName: (sanitized.brandName as string) || '',
          heroTitle: (sanitized.heroTitle as string) || '',
          heroSubtitle: (sanitized.heroSubtitle as string) || '',
          bioTitle: (sanitized.bioTitle as string) || '',
         bioContent: (sanitized.bioContent as string) || '',
         bioImage: sanitized.bioImage as string | undefined,
         contactPhone: (sanitized.contactPhone as string) || '',
          contactEmail: (sanitized.contactEmail as string) || '',
          contactWechat: (sanitized.contactWechat as string) || '',
          locationText: (sanitized.locationText as string) || '',
          bilibiliUrl: sanitized.bilibiliUrl as string | undefined,
          footerText: (sanitized.footerText as string) || '',
        },
      });
    }
    const updateData = Object.fromEntries(
      Object.entries(sanitized).filter(([, v]) => v !== null),
    );
    return this.prisma.siteConfig.update({
      where: { id: existing.id },
      data: updateData,
    });
  }
}
