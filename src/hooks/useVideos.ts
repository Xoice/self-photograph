import { useQuery } from '@tanstack/react-query';
import { getVideos } from '@/api/videos';
import type { VideosQuery } from '@/types/api';

export function useVideos(query?: VideosQuery) {
  return useQuery({
    queryKey: ['videos', query],
    queryFn: () => getVideos(query),
  });
}
