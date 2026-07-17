import { Controller, Post, Get, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class AdminMediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: { id: string }, @Body('customName') customName?: string) {
    return this.mediaService.upload(file, user.id, customName);
  }

  @Get()
  async getMediaList(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('type') type?: string) {
    return this.mediaService.getMediaList({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      type,
    });
  }

  @Delete(':id')
  async deleteMedia(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.deleteMedia(id);
  }
}
