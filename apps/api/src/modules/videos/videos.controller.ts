import { Controller, Get, Query } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  async getVideos(@Query() query: any) {
    return this.videosService.getVideos(query);
  }
}
