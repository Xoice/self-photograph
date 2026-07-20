import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateContactLeadDto, CreateEnrollmentDto } from './dto/leads.dto';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('contact')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async submitContact(@Body() data: CreateContactLeadDto) {
    return this.leadsService.submitContact(data);
  }

  @Post('workshop-enrollments')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async submitEnrollment(@Body() data: CreateEnrollmentDto) {
    return this.leadsService.submitEnrollment(data);
  }
}
