import { useQuery } from '@tanstack/react-query';
import { getGalleryCategories } from '@/api/gallery';

export function useGalleryCategories() {
  return useQuery({
    queryKey: ['gallery-categories'],
    queryFn: getGalleryCategories,
    staleTime: 10 * 60 * 1000,
  });
}
