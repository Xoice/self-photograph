import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateVideoDto, UpdateVideoDto } from './dto/videos.dto';

@Controller('admin/videos')
@UseGuards(JwtAuthGuard)
export class AdminVideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  async getVideos(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.videosService.getVideos({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
      publishedOnly: false,
    });
  }

  @Post()
  async createVideo(@Body() data: CreateVideoDto) {
    return this.videosService.createVideo(data);
  }

  @Patch(':id')
  async updateVideo(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateVideoDto) {
    return this.videosService.updateVideo(id, data);
  }

  @Delete(':id')
  async deleteVideo(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.deleteVideo(id);
  }
}
