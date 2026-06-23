import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Get()
  async getWorkshops(@Query() query: any) {
    return this.workshopsService.getWorkshops(query);
  }

  @Get(':slug')
  async getWorkshopBySlug(@Param('slug') slug: string) {
    return this.workshopsService.getWorkshopBySlug(slug);
  }
}
