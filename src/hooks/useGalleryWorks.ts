import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getGalleryWorks } from '@/api/gallery';
import type { GalleryWorksQuery } from '@/types/api';

export function useGalleryWorks(query?: GalleryWorksQuery) {
  return useQuery({
    queryKey: ['gallery-works', query],
    queryFn: () => getGalleryWorks(query),
    placeholderData: keepPreviousData,
  });
}
