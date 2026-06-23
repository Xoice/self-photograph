export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  wechat: string;
  location: string;
}

export interface SocialLinks {
  bilibili?: string;
}

export interface SiteConfig {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  bioTitle: string;
  bioContent: string;
  contact: ContactInfo;
  socialLinks: SocialLinks;
  footerText: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
  children?: GalleryCategory[];
}

export interface FlatGalleryCategory extends GalleryCategory {
  _parent?: string;
}

export interface GalleryWorkItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  categoryId: string | null;
  category: { name: string; slug: string };
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string;
}

export interface GalleryWorkDetail extends GalleryWorkItem {
  description: string;
  images: string[];
  location: string;
  shootDate: string;
  cameraInfo: string;
}

export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  platform: string;
  videoUrl: string;
  coverImage: string;
  durationSeconds: number;
  durationText: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
}

export type WorkshopStatus =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'full'
  | 'closed';

export interface WorkshopSummary {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  content?: string;
  coverImage: string;
  priceText: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  level: string;
  durationText: string;
  status: WorkshopStatus;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  tags: string[];
}

export interface WorkshopHighlight {
  title: string;
  content: string;
}

export interface ItineraryDay {
  dayIndex: number;
  title: string;
  content: string;
}

export interface WorkshopDetail extends WorkshopSummary {
  content: string;
  highlights: WorkshopHighlight[];
  itinerary: ItineraryDay[];
  feeIncludes: string[];
  feeExcludes: string[];
  contact: ContactInfo;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  message: string;
  sourcePage?: string;
}

export interface WorkshopEnrollmentPayload {
  workshopSlug: string;
  name: string;
  phone: string;
  wechat: string;
  email: string;
  message?: string;
}

export interface SubmissionResult {
  id: string;
}

export interface GalleryWorksQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VideosQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  publishedOnly?: boolean;
}

export interface WorkshopsQuery {
  page?: number;
  pageSize?: number;
  featured?: boolean;
  status?: WorkshopStatus;
  keyword?: string;
}
