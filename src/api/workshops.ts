import apiClient from './client';
import type {
  WorkshopSummary,
  WorkshopDetail,
  AdminWorkshopDetail,
  WorkshopsQuery,
  PaginatedData,
} from '@/types/api';

export function getWorkshops(
  query?: WorkshopsQuery,
): Promise<PaginatedData<WorkshopSummary>> {
  return apiClient.get('/workshops', { params: query });
}

export function getWorkshopBySlug(slug: string): Promise<WorkshopDetail> {
  return apiClient.get(`/workshops/${slug}`);
}

export function getWorkshopById(id: string): Promise<AdminWorkshopDetail> {
  return apiClient.get(`/admin/workshops/${id}`);
}

export function addWorkshopHighlight(workshopId: string, data: { title: string; content: string; sortOrder?: number }) {
  return apiClient.post(`/admin/workshops/${workshopId}/highlights`, data);
}

export function updateWorkshopHighlight(workshopId: string, highlightId: string, data: { title?: string; content?: string; sortOrder?: number }) {
  return apiClient.patch(`/admin/workshops/${workshopId}/highlights/${highlightId}`, data);
}

export function deleteWorkshopHighlight(workshopId: string, highlightId: string) {
  return apiClient.delete(`/admin/workshops/${workshopId}/highlights/${highlightId}`);
}

export function addWorkshopItinerary(workshopId: string, data: { dayIndex: number; title: string; content: string; sortOrder?: number }) {
  return apiClient.post(`/admin/workshops/${workshopId}/itinerary`, data);
}

export function updateWorkshopItinerary(workshopId: string, itineraryId: string, data: { dayIndex?: number; title?: string; content?: string; sortOrder?: number }) {
  return apiClient.patch(`/admin/workshops/${workshopId}/itinerary/${itineraryId}`, data);
}

export function deleteWorkshopItinerary(workshopId: string, itineraryId: string) {
  return apiClient.delete(`/admin/workshops/${workshopId}/itinerary/${itineraryId}`);
}

export function addWorkshopFeeItem(workshopId: string, data: { type: string; content: string; sortOrder?: number }) {
  return apiClient.post(`/admin/workshops/${workshopId}/fee-items`, data);
}

export function updateWorkshopFeeItem(workshopId: string, feeItemId: string, data: { type?: string; content?: string; sortOrder?: number }) {
  return apiClient.patch(`/admin/workshops/${workshopId}/fee-items/${feeItemId}`, data);
}

export function deleteWorkshopFeeItem(workshopId: string, feeItemId: string) {
  return apiClient.delete(`/admin/workshops/${workshopId}/fee-items/${feeItemId}`);
}
