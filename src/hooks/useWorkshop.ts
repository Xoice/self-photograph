import { useQuery } from '@tanstack/react-query';
import { getWorkshopBySlug } from '@/api/workshops';

export function useWorkshop(slug: string) {
  return useQuery({
    queryKey: ['workshop', slug],
    queryFn: () => getWorkshopBySlug(slug),
    enabled: !!slug,
  });
}
