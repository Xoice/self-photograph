import apiClient from './client';

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface UploadResult {
  id: string;
  url: string;
  fileName: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/admin/media/upload', formData);
}

export function getMediaList(query?: {
  page?: number;
  pageSize?: number;
  type?: string;
}): Promise<{ items: MediaItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  return apiClient.get('/admin/media', { params: query });
}

export function deleteMedia(id: string): Promise<void> {
  return apiClient.delete(`/admin/media/${id}`);
}
