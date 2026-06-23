import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard)
export class AdminLeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get('contact')
  async getContactLeads(@Query() query: any) {
    return this.leadsService.getContactLeads(query);
  }

  @Patch('contact/:id/status')
  async updateContactLeadStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: string) {
    return this.leadsService.updateContactLeadStatus(id, status);
  }

  @Delete('contact/:id')
  async deleteContactLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.deleteContactLead(id);
  }

  @Get('workshop-enrollments')
  async getEnrollments(@Query() query: any) {
    return this.leadsService.getEnrollments(query);
  }
}
