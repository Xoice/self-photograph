import apiClient from './client';
import type {
  ContactSubmissionPayload,
  WorkshopEnrollmentPayload,
  SubmissionResult,
} from '@/types/api';

export function submitContact(
  payload: ContactSubmissionPayload,
): Promise<SubmissionResult> {
  return apiClient.post('/leads/contact', payload);
}

export function submitWorkshopEnrollment(
  payload: WorkshopEnrollmentPayload,
): Promise<SubmissionResult> {
  return apiClient.post('/leads/workshop-enrollments', payload);
}

export function getAdminContactLeads(query?: {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}) {
  return apiClient.get('/admin/leads/contact', { params: query });
}

export function updateContactLeadStatus(id: string, status: string) {
  return apiClient.patch(`/admin/leads/contact/${id}/status`, { status });
}

export function getAdminEnrollments(query?: {
  page?: number;
  pageSize?: number;
}) {
  return apiClient.get('/admin/leads/workshop-enrollments', { params: query });
}
