import { 
  Container, 
  Box,
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatters';
import { ProductSkeletonGrid } from '../../components/common/ProductSkeleton';
import type { ProductDTO } from '../../api/types';
import { ROUTES } from '../../utils/constants';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading, error } = useProducts({
    page,
    size: 12,
    query: debouncedSearch || undefined,
    categoryId: selectedCategory || undefined,
  });

  const handleAddToCart = (product: ProductDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    addItem(product, 1);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Products</Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value as number | '')}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categoriesData?.map((category) => (
              <MenuItem key={category.categoryId} value={category.categoryId}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <ProductSkeletonGrid count={12} />}
      {error && <Alert severity="error" sx={{ mb: 4 }}>Failed to load products</Alert>}

      {!isLoading && !error && (
        <>
          {productsData?.content.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">No products found</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
                {productsData?.content.map((product) => (
                  <Card 
                    key={product.productId}
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                    onClick={() => handleProductClick(product.productId)}
                  >
                    <CardMedia sx={{ pt: '75%', bgcolor: 'grey.200', position: 'relative' }}>
                      {product.isActive === false && <Chip label="Inactive" color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                        {product.categoryName}
                      </Typography>
                      <Typography variant="h6" gutterBottom sx={{ minHeight: '3em' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {formatPrice(product.basePrice)}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.isActive === false}
                      >
                        {isAuthenticated ? 'Add to Cart' : 'Login to Buy'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {productsData && productsData.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination count={productsData.totalPages} page={page + 1} onChange={handlePageChange} color="primary" size="large" />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage;
