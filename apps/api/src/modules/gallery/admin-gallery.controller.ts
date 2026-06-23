import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateWorkDto, UpdateWorkDto, CreateCategoryDto, UpdateCategoryDto } from './dto/gallery.dto';

@Controller('admin/gallery')
@UseGuards(JwtAuthGuard)
export class AdminGalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get('categories')
  async getCategories() {
    return this.galleryService.getCategories(false, true);
  }

  @Post('categories')
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.galleryService.createCategory(data);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateCategoryDto) {
    return this.galleryService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.deleteCategory(id);
  }

  @Get('works')
  async getWorks(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.galleryService.getWorks({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
      includeUnpublished: true,
    });
  }

  @Post('works')
  async createWork(@Body() data: CreateWorkDto) {
    return this.galleryService.createWork(data);
  }

  @Patch('works/:id')
  async updateWork(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateWorkDto) {
    return this.galleryService.updateWork(id, data);
  }

  @Delete('works/:id')
  async deleteWork(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.deleteWork(id);
  }
}
