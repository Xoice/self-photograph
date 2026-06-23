import apiClient from './client';
import type { VideoItem, VideosQuery, PaginatedData } from '@/types/api';

export function getVideos(query?: VideosQuery): Promise<PaginatedData<VideoItem>> {
  return apiClient.get('/videos', { params: query });
}
