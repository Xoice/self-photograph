import { useQuery } from '@tanstack/react-query';
import { getWorkshops } from '@/api/workshops';
import type { WorkshopsQuery } from '@/types/api';

export function useWorkshops(query?: WorkshopsQuery) {
  return useQuery({
    queryKey: ['workshops', query],
    queryFn: () => getWorkshops(query),
  });
}
