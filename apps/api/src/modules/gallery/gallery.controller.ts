import { Controller, Get, Param, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get('categories')
  async getCategories(@Query('visibleOnly') visibleOnly?: string) {
    return this.galleryService.getCategories(visibleOnly !== 'false');
  }

  @Get('works')
  async getWorks(@Query() query: Record<string, string>) {
    return this.galleryService.getWorks(query);
  }

  @Get('works/:slug')
  async getWorkBySlug(@Param('slug') slug: string) {
    return this.galleryService.getWorkBySlug(slug);
  }
}
