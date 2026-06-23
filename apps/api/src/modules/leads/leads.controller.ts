import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('contact')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async submitContact(@Body() data: { name: string; email: string; message: string; sourcePage?: string }) {
    return this.leadsService.submitContact(data);
  }

  @Post('workshop-enrollments')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async submitEnrollment(@Body() data: {
    workshopSlug: string;
    name: string;
    phone: string;
    wechat: string;
    email: string;
    message?: string;
  }) {
    return this.leadsService.submitEnrollment(data);
  }
}
