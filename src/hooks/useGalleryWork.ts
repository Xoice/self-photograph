import { useQuery } from '@tanstack/react-query';
import { getGalleryWorkBySlug } from '@/api/gallery';

export function useGalleryWork(slug: string) {
  return useQuery({
    queryKey: ['gallery-work', slug],
    queryFn: () => getGalleryWorkBySlug(slug),
    enabled: !!slug,
  });
}
