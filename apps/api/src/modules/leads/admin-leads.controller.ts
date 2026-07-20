import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateLeadStatusDto } from './dto/leads.dto';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard)
export class AdminLeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get('contact')
  async getContactLeads(@Query() query: Record<string, string>) {
    return this.leadsService.getContactLeads(query);
  }

  @Patch('contact/:id/status')
  async updateContactLeadStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateContactLeadStatus(id, body.status);
  }

  @Delete('contact/:id')
  async deleteContactLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.deleteContactLead(id);
  }

  @Get('workshop-enrollments')
  async getEnrollments(@Query() query: Record<string, string>) {
    return this.leadsService.getEnrollments(query);
  }
}
