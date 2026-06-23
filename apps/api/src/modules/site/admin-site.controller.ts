import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SiteService } from './site.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateSiteConfigDto } from './dto/site.dto';

@Controller('admin/site')
@UseGuards(JwtAuthGuard)
export class AdminSiteController {
  constructor(private siteService: SiteService) {}

  @Get('config')
  async getConfig() {
    return this.siteService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() data: UpdateSiteConfigDto) {
    return this.siteService.updateConfig(data);
  }
}
