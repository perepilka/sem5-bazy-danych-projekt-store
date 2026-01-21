import { Card, CardContent, Skeleton, Box } from '@mui/material';

export const ProductSkeleton = () => {
  return (
    <Card>
      <Skeleton variant="rectangular" sx={{ pt: '75%' }} />
      <CardContent>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="100%" height={60} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
};

export const ProductSkeletonGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: '1fr 1fr', 
        md: '1fr 1fr 1fr', 
        lg: '1fr 1fr 1fr 1fr' 
      }, 
      gap: 3 
    }}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </Box>
  );
};
