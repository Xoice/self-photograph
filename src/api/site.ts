import apiClient from './client';
import type { SiteConfig } from '@/types/api';

export function getSiteConfig(): Promise<SiteConfig> {
  return apiClient.get('/site/config');
}
