import { Box, Skeleton, Grid } from '@mui/material';

interface SectionSkeletonProps {
  count?: number;
  variant?: 'card' | 'rectangular';
  height?: number;
}

export default function SectionSkeleton({ count = 4, variant = 'card', height = 400 }: SectionSkeletonProps) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton
            variant="rectangular"
            height={height}
            sx={{
              bgcolor: '#1a1a1a',
              borderRadius: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.4 },
                '50%': { opacity: 0.7 },
              },
            }}
          />
          {variant === 'card' && (
            <Box sx={{ mt: 1 }}>
              <Skeleton variant="text" width="60%" sx={{ bgcolor: '#1a1a1a' }} />
              <Skeleton variant="text" width="40%" sx={{ bgcolor: '#1a1a1a' }} />
            </Box>
          )}
        </Grid>
      ))}
    </Grid>
  );
}
