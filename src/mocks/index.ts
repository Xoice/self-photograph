import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedData } from '@/types/api';
import { mockSiteConfig } from './siteConfig';
import { mockGalleryWorks } from './gallery';
import { mockVideos } from './videos';
import { mockWorkshops, mockWorkshopDetail } from './workshops';

function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'ok', data };
}

function paginated<T>(items: T[], page = 1, pageSize = 12): ApiResponse<PaginatedData<T>> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  return ok({
    items,
    pagination: { page, pageSize, total, totalPages },
  });
}

function getMockResponse(method: string, url: string, _data?: unknown): ApiResponse<unknown> | null {
  const path = url.split('?')[0];
  const key = `${method} ${path}`;

  const mockCategories = [
    { id: 'cat_portrait', name: '人像', slug: 'portrait', parentId: null, sortOrder: 1, isVisible: true, children: [
      { id: 'cat_private', name: '私房', slug: 'private', parentId: 'cat_portrait', sortOrder: 1, isVisible: true },
    ]},
    { id: 'cat_landscape', name: '风景', slug: 'landscape', parentId: null, sortOrder: 2, isVisible: true, children: [
      { id: 'cat_mountain', name: '山峦', slug: 'mountain', parentId: 'cat_landscape', sortOrder: 1, isVisible: true },
    ]},
    { id: 'cat_county', name: '县城', slug: 'county', parentId: null, sortOrder: 3, isVisible: true, children: [] },
    { id: 'cat_stars', name: '星空', slug: 'stars', parentId: null, sortOrder: 4, isVisible: true, children: [] },
  ];

  const routes: Record<string, () => ApiResponse<unknown>> = {
    'GET /site/config': () => ok(mockSiteConfig),
    'GET /gallery/categories': () => ok(mockCategories),
    'GET /gallery/works': () => paginated(mockGalleryWorks),
    'GET /videos': () => paginated(mockVideos),
    'GET /workshops': () => paginated(mockWorkshops),
    'POST /leads/contact': () => ok({ id: `mock_${Date.now()}` }),
    'POST /leads/workshop-enrollments': () => ok({ id: `mock_${Date.now()}` }),
    'POST /admin/auth/login': () => ok({
      accessToken: 'mock_jwt_token_' + Date.now(),
      user: { id: 'user_001', email: 'admin@xoice.com', name: 'Xoice', role: 'admin' },
    }),
    'GET /admin/auth/me': () => ok({ id: 'user_001', email: 'admin@xoice.com', name: 'Xoice', role: 'admin' }),
    'GET /admin/gallery/categories': () => ok(mockCategories),
    'POST /admin/gallery/categories': () => ok({ id: `mock_cat_${Date.now()}`, name: '新分类', slug: 'new-cat', parentId: null, sortOrder: 0, isVisible: true, children: [] }),
    'GET /admin/gallery/works': () => paginated(mockGalleryWorks),
    'POST /admin/gallery/works': () => ok({ id: `mock_work_${Date.now()}` }),
    'GET /admin/videos': () => paginated(mockVideos),
    'POST /admin/videos': () => ok({ id: `mock_video_${Date.now()}` }),
    'GET /admin/workshops': () => paginated(mockWorkshops),
    'POST /admin/workshops': () => ok({ id: `mock_workshop_${Date.now()}` }),
    'GET /admin/leads/contact': () => paginated([]),
    'GET /admin/leads/workshop-enrollments': () => paginated([]),
    'POST /admin/media/upload': () => ok({
      id: `mock_media_${Date.now()}`,
      url: `https://picsum.photos/seed/upload${Date.now()}/800/600.jpg`,
      fileName: 'uploaded.jpg',
      width: 800,
      height: 600,
      sizeBytes: 102400,
    }),
    'GET /admin/media': () => paginated([]),
  };

  if (key in routes) {
    return routes[key]();
  }

  if (path.startsWith('/gallery/works/')) {
    const slug = path.split('/gallery/works/')[1];
    if (slug) {
      const work = mockGalleryWorks.find((w) => w.slug === slug);
      if (work) {
        return ok({ ...work, description: `${work.title}的完整介绍。`, images: [work.coverImage], location: '中国', shootDate: work.publishedAt, cameraInfo: 'Sony A7R5 + 70-200GM' });
      }
    }
  }

  if (path.startsWith('/admin/gallery/works/') && (method === 'PATCH' || method === 'DELETE')) {
    return ok({ success: true });
  }
  if (path.startsWith('/admin/gallery/categories/') && (method === 'PATCH' || method === 'DELETE')) {
    return ok({ success: true });
  }
  if (path.startsWith('/admin/videos/') && (method === 'PATCH' || method === 'DELETE')) {
    return ok({ success: true });
  }
  if (path.startsWith('/admin/workshops/') && (method === 'PATCH' || method === 'DELETE')) {
    return ok({ success: true });
  }
  if (path.startsWith('/admin/media/') && method === 'DELETE') {
    return ok({ success: true });
  }

  if (path.startsWith('/workshops/')) {
    const slug = path.split('/workshops/')[1];
    if (slug === mockWorkshopDetail.slug) {
      return ok(mockWorkshopDetail);
    }
    const ws = mockWorkshops.find((w) => w.slug === slug);
    if (ws) {
      return ok({ ...ws, content: ws.summary, highlights: [], itinerary: [], feeIncludes: [], feeExcludes: [], contact: mockSiteConfig.contact });
    }
  }

  return { code: 40002, message: 'Not found', data: null };
}

export function createMockAdapter(): AxiosAdapter {
  return (config: AxiosRequestConfig) => {
    return new Promise<AxiosResponse>((resolve) => {
      const method = (config.method || 'get').toUpperCase();
      const url = config.url || '';
      const mockData = getMockResponse(method, url, config.data);

      setTimeout(() => {
        resolve({
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config as any,
        });
      }, 100);
    });
  };
}
