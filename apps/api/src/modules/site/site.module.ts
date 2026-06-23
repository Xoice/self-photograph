import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { AdminSiteController } from './admin-site.controller';

@Module({
  controllers: [SiteController, AdminSiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
