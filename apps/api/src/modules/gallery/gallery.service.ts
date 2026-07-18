import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

interface CategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
}
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(visibleOnly = true, includeAll = false) {
    const where: Prisma.GalleryCategoryWhereInput = { parentId: null };
    if (visibleOnly && !includeAll) where.isVisible = true;

    const categories = await this.prisma.galleryCategory.findMany({
      where,
      include: {
        children: {
          where: visibleOnly && !includeAll ? { isVisible: true } : undefined,
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      isVisible: cat.isVisible,
      children: cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parentId: child.parentId,
        sortOrder: child.sortOrder,
        isVisible: child.isVisible,
      })),
    }));
  }

  async createCategory(data: CategoryInput) {
    const existing = await this.prisma.galleryCategory.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('slug 已存在');
    if (data.parentId) {
      const parent = await this.prisma.galleryCategory.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundException('父分类不存在');
    }
    const { parentId, ...rest } = data;
    return this.prisma.galleryCategory.create({
      data: {
        name: rest.name!,
        slug: rest.slug!,
        sortOrder: rest.sortOrder,
        isVisible: rest.isVisible,
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      } as Prisma.GalleryCategoryCreateInput,
    });
  }

  async updateCategory(id: string, data: CategoryInput) {
    if (data.slug) {
      const existing = await this.prisma.galleryCategory.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) throw new ConflictException('slug 已存在');
    }
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        // Clear parent — move to top-level
      } else if (data.parentId === id) {
        throw new ConflictException('不能将分类设为自己的父分类');
      } else {
        const parent = await this.prisma.galleryCategory.findUnique({ where: { id: data.parentId } });
        if (!parent) throw new NotFoundException('父分类不存在');
        if (parent.parentId === id) throw new ConflictException('不能创建循环引用');
        if (parent.parentId !== null) throw new ConflictException('不能将分类设为子分类的子分类');
      }
    }
    const { parentId, ...rest } = data;
    const payload: Prisma.GalleryCategoryUpdateInput = (rest as Prisma.GalleryCategoryUpdateInput);
    if (parentId !== undefined) {
      if (parentId === null) payload.parent = { disconnect: true };
      else payload.parent = { connect: { id: parentId } };
    }
    return this.prisma.galleryCategory.update({ where: { id }, data: payload });
  }

  async deleteCategory(id: string) {
    const [workCount, childCount] = await this.prisma.$transaction([
      this.prisma.galleryWork.count({ where: { categoryId: id } }),
      this.prisma.galleryCategory.count({ where: { parentId: id } }),
    ]);
    if (workCount > 0) throw new ConflictException('该分类下仍有作品，无法删除');
    if (childCount > 0) throw new ConflictException('该分类下仍有子分类，无法删除');
    return this.prisma.galleryCategory.delete({ where: { id } });
  }

  async getWorks(query: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    featured?: boolean;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeUnpublished?: boolean;
  }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 12;
    const skip = (page - 1) * pageSize;

    const allowedSortBy = ['sortOrder', 'createdAt', 'title'];
    const sortBy = allowedSortBy.includes(query.sortBy || '') ? query.sortBy! : 'sortOrder';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const where: Prisma.GalleryWorkWhereInput = {};
    if (!query.includeUnpublished) where.isPublished = true;
    if (query.featured) where.isFeatured = true;
    if (query.category) where.category = { slug: query.category };
    if (query.tag) where.tags = { some: { slug: query.tag } };
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword } },
        { summary: { contains: query.keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.galleryWork.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          tags: { select: { name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.prisma.galleryWork.count({ where }),
    ]);

    return {
      items: items.map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        summary: w.summary,
        coverImage: w.coverImage,
        categoryId: w.categoryId,
        category: w.category,
        tags: w.tags.map((t) => t.name),
        isFeatured: w.isFeatured,
        isPublished: w.isPublished,
        sortOrder: w.sortOrder,
        // 没有 publishedAt 字段：仅在已发布时给一个有意义的日期（拍摄日期优先，否则用创建时间），未发布返回 null
        publishedAt: w.isPublished ? (w.shootDate ?? w.createdAt).toISOString() : null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getWorkBySlug(slug: string, includeUnpublished = false) {
    const work = await this.prisma.galleryWork.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true } },
      },
    });
    if (!work) throw new NotFoundException('作品不存在');
    if (!includeUnpublished && !work.isPublished) throw new NotFoundException('作品不存在');
    return {
      id: work.id,
      title: work.title,
      slug: work.slug,
      summary: work.summary,
      description: work.description,
      coverImage: work.coverImage,
      images: work.thumbnailImage ? [work.coverImage, work.thumbnailImage] : [work.coverImage],
      category: work.category,
      tags: work.tags.map((t) => t.name),
      location: work.location,
      shootDate: work.shootDate?.toISOString(),
      cameraInfo: work.cameraInfo,
    };
  }

  async createWork(data: Prisma.GalleryWorkCreateInput) {
    const existing = await this.prisma.galleryWork.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('slug 已存在');
    return this.prisma.galleryWork.create({ data });
  }

  async updateWork(id: string, data: Prisma.GalleryWorkUpdateInput) {
    return this.prisma.galleryWork.update({ where: { id }, data });
  }

  async deleteWork(id: string) {
    return this.prisma.galleryWork.delete({ where: { id } });
  }
}
