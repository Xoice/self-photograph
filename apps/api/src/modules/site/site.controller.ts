import { Controller, Get } from '@nestjs/common';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private siteService: SiteService) {}

  @Get('config')
  async getConfig() {
    return this.siteService.getConfig();
  }
}
