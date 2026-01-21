import {
  Container,
  Grid,
  Card,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProductAvailability } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { data: product, isLoading: productLoading, error: productError } = useProduct(productId);
  const { data: availability, isLoading: availabilityLoading } = useProductAvailability(productId);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (product) {
      addItem(product, 1);
      navigate(ROUTES.CART);
    }
  };

  if (productLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (productError || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load product details. The product may not exist.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.PRODUCTS)}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(ROUTES.PRODUCTS)}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <Box
              sx={{
                pt: '100%',
                bgcolor: 'grey.200',
                position: 'relative',
              }}
            >
              {!product.isActive && (
                <Chip
                  label="Inactive"
                  color="error"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Chip label={product.categoryName} color="primary" size="small" sx={{ mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 2 }}>
              {formatPrice(product.basePrice)}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description || 'No description available.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Product ID: {product.productId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {product.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{ mt: 2 }}
            >
              {isAuthenticated ? 'Add to Cart' : 'Login to Buy'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Store Availability
        </Typography>

        {availabilityLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : availability ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Store Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(availability.storeAvailability).map((store) => (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.storeName}</TableCell>
                    <TableCell>{store.city}</TableCell>
                    <TableCell align="right">{store.availableCount}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={store.availableCount > 0 ? 'In Stock' : 'Out of Stock'}
                        color={store.availableCount > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Availability information is not available.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
