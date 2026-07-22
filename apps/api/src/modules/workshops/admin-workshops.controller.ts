import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateWorkshopDto,
  UpdateWorkshopDto,
  CreateHighlightDto,
  UpdateHighlightDto,
  CreateItineraryDto,
  UpdateItineraryDto,
  CreateFeeItemDto,
  UpdateFeeItemDto,
} from './dto/workshops.dto';

@Controller('admin/workshops')
@UseGuards(JwtAuthGuard)
export class AdminWorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Get()
  async getWorkshops(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.workshopsService.getWorkshops({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
      includeUnpublished: 'true',
    });
  }

  @Get(':id')
  async getWorkshopById(@Param('id', ParseUUIDPipe) id: string) {
    return this.workshopsService.getWorkshopById(id);
  }

  @Post()
  async createWorkshop(@Body() data: CreateWorkshopDto) {
    return this.workshopsService.createWorkshop(data);
  }

  @Patch(':id')
  async updateWorkshop(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateWorkshopDto) {
    return this.workshopsService.updateWorkshop(id, data);
  }

  @Delete(':id')
  async deleteWorkshop(@Param('id', ParseUUIDPipe) id: string) {
    return this.workshopsService.deleteWorkshop(id);
  }

  @Post(':id/highlights')
  async addHighlight(@Param('id', ParseUUIDPipe) id: string, @Body() data: CreateHighlightDto) {
    return this.workshopsService.addHighlight(id, data);
  }

  @Patch(':id/highlights/:highlightId')
  async updateHighlight(@Param('id', ParseUUIDPipe) id: string, @Param('highlightId', ParseUUIDPipe) highlightId: string, @Body() data: UpdateHighlightDto) {
    return this.workshopsService.updateHighlight(id, highlightId, data);
  }

  @Delete(':id/highlights/:highlightId')
  async deleteHighlight(@Param('id', ParseUUIDPipe) id: string, @Param('highlightId', ParseUUIDPipe) highlightId: string) {
    return this.workshopsService.deleteHighlight(id, highlightId);
  }

  @Post(':id/itinerary')
  async addItinerary(@Param('id', ParseUUIDPipe) id: string, @Body() data: CreateItineraryDto) {
    return this.workshopsService.addItinerary(id, data);
  }

  @Patch(':id/itinerary/:itineraryId')
  async updateItinerary(@Param('id', ParseUUIDPipe) id: string, @Param('itineraryId', ParseUUIDPipe) itineraryId: string, @Body() data: UpdateItineraryDto) {
    return this.workshopsService.updateItinerary(id, itineraryId, data);
  }

  @Delete(':id/itinerary/:itineraryId')
  async deleteItinerary(@Param('id', ParseUUIDPipe) id: string, @Param('itineraryId', ParseUUIDPipe) itineraryId: string) {
    return this.workshopsService.deleteItinerary(id, itineraryId);
  }

  @Post(':id/fee-items')
  async addFeeItem(@Param('id', ParseUUIDPipe) id: string, @Body() data: CreateFeeItemDto) {
    return this.workshopsService.addFeeItem(id, data);
  }

  @Patch(':id/fee-items/:feeItemId')
  async updateFeeItem(@Param('id', ParseUUIDPipe) id: string, @Param('feeItemId', ParseUUIDPipe) feeItemId: string, @Body() data: UpdateFeeItemDto) {
    return this.workshopsService.updateFeeItem(id, feeItemId, data);
  }

  @Delete(':id/fee-items/:feeItemId')
  async deleteFeeItem(@Param('id', ParseUUIDPipe) id: string, @Param('feeItemId', ParseUUIDPipe) feeItemId: string) {
    return this.workshopsService.deleteFeeItem(id, feeItemId);
  }
}
