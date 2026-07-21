import apiClient from './client';
import type {
  GalleryCategory,
  GalleryWorkItem,
  GalleryWorkDetail,
  GalleryWorksQuery,
  PaginatedData,
} from '@/types/api';

export function getGalleryCategories(): Promise<GalleryCategory[]> {
  return apiClient.get('/gallery/categories', { params: { visibleOnly: true } });
}

export function getAdminCategories(): Promise<GalleryCategory[]> {
  return apiClient.get('/admin/gallery/categories');
}

export function createCategory(data: { name: string; slug: string; parentId?: string; sortOrder?: number; isVisible?: boolean }): Promise<GalleryCategory> {
  return apiClient.post('/admin/gallery/categories', data);
}

export function updateCategory(id: string, data: { name?: string; slug?: string; parentId?: string; sortOrder?: number; isVisible?: boolean }): Promise<GalleryCategory> {
  return apiClient.patch(`/admin/gallery/categories/${id}`, data);
}

export function deleteCategory(id: string): Promise<void> {
  return apiClient.delete(`/admin/gallery/categories/${id}`);
}

export interface SlugCheckResult {
  available: boolean;
  suggestion: string;
}

export function checkSlug(slug: string, excludeId?: string): Promise<SlugCheckResult> {
  return apiClient.get('/admin/gallery/works/check-slug', {
    params: { slug, excludeId },
  });
}

export function getGalleryWorks(
  query?: GalleryWorksQuery,
): Promise<PaginatedData<GalleryWorkItem>> {
  return apiClient.get('/gallery/works', { params: query });
}

export function getGalleryWorkBySlug(slug: string): Promise<GalleryWorkDetail> {
  return apiClient.get(`/gallery/works/${slug}`);
}
