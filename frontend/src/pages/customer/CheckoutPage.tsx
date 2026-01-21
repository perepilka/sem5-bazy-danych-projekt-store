import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import { ordersApi } from '../../api/endpoints/orders';
import { productsApi } from '../../api/endpoints/products';
import { useStores } from '../../hooks/useStores';
import { formatPrice } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';
import type { CreateOrderRequest } from '../../api/types';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, pickupStoreId, setPickupStore, clearCart, getTotalAmount } = useCartStore();
  const { data: storesData, isLoading: storesLoading } = useStores({ size: 100 });
  const [selectedStore, setSelectedStore] = useState(pickupStoreId || '');
  const [error, setError] = useState<string | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [unavailableProducts, setUnavailableProducts] = useState<Array<{ productId: number, name: string, available: number, requested: number }>>([]);

  // Fetch availability for all products in cart when store is selected
  const { data: availabilityData } = useQuery({
    queryKey: ['productAvailability', items.map(i => i.productId), selectedStore],
    queryFn: async () => {
      if (!selectedStore || items.length === 0) return null;

      // Fetch availability for each product
      const results = await Promise.all(
        items.map(item => productsApi.getProductAvailability(item.productId))
      );

      return results;
    },
    enabled: !!selectedStore && items.length > 0,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: CreateOrderRequest) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      clearCart();
      navigate(ROUTES.ORDERS, {
        state: { message: 'Order placed successfully!' }
      });
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create order';
      setError(errorMessage);
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedStore) {
      setError('Please select a pickup store');
      return;
    }

    // Check if all products are available in the selected store
    const unavailable: Array<{ productId: number, name: string, available: number, requested: number }> = [];

    if (availabilityData) {
      items.forEach((item, index) => {
        const availability = availabilityData[index];
        if (availability) {
          const storeAvailability = availability.storeAvailability[selectedStore];
          const available = storeAvailability?.availableCount || 0;

          if (available < item.quantity) {
            unavailable.push({
              productId: item.productId,
              name: item.name,
              available,
              requested: item.quantity
            });
          }
        }
      });
    }

    if (unavailable.length > 0) {
      setUnavailableProducts(unavailable);
      setShowWarningDialog(true);
      return;
    }

    // All products available, proceed with order
    proceedWithOrder(false);
  };

  const proceedWithOrder = (ignoreAvailability: boolean = false) => {
    const orderData: CreateOrderRequest = {
      pickupStoreId: Number(selectedStore),
      lines: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      ignoreAvailability,
    };

    console.log('Placing order:', orderData);
    setError(null);
    setPickupStore(Number(selectedStore));
    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">
          Your cart is empty. Please add items before checking out.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Browse Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Order Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <List>
              {items.map((item) => (
                <ListItem
                  key={item.productId}
                  sx={{
                    px: 0,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.quantity} × ${formatPrice(item.basePrice)}`}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatPrice(item.basePrice * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                {formatPrice(getTotalAmount())}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Pickup Store Selection */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pickup Store</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select a store for pickup. Stores show availability for your cart items.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Select Store</InputLabel>
              <Select
                value={selectedStore}
                label="Select Store"
                onChange={(e) => setSelectedStore(e.target.value)}
                disabled={storesLoading || createOrderMutation.isPending}
              >
                {storesLoading ? (
                  <MenuItem disabled>Loading stores...</MenuItem>
                ) : (
                  storesData?.content?.map((store) => {
                    // Check if this store has all items
                    let hasAllItems = true;
                    let unavailableCount = 0;

                    if (availabilityData && selectedStore) {
                      items.forEach((item, index) => {
                        const availability = availabilityData[index];
                        if (availability) {
                          const storeAvail = availability.storeAvailability[store.storeId];
                          const available = storeAvail?.availableCount || 0;
                          if (available < item.quantity) {
                            hasAllItems = false;
                            unavailableCount++;
                          }
                        }
                      });
                    }

                    return (
                      <MenuItem key={store.storeId} value={store.storeId}>
                        {store.city} - {store.address}
                        {!hasAllItems && availabilityData && selectedStore && (
                          <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.85rem' }}>
                            ({unavailableCount} item{unavailableCount !== 1 ? 's' : ''} unavailable)
                          </Typography>
                        )}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(ROUTES.CART)}
            disabled={createOrderMutation.isPending}
          >
            Back to Cart
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handlePlaceOrder}
            disabled={!selectedStore || createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Place Order'
            )}
          </Button>
        </Stack>
      </Stack>

      {/* Warning Dialog for Unavailable Items */}
      <Dialog
        open={showWarningDialog}
        onClose={() => setShowWarningDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Some Items Not Available</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The selected store doesn't have sufficient stock for some items. Your order may take longer to fulfill as items will need to be delivered from other locations.
          </Alert>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Requested</TableCell>
                <TableCell align="right">Available</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unavailableProducts.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.requested}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {product.available}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Do you want to proceed with this order? It may take 3-5 additional days for delivery.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarningDialog(false)}>
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowWarningDialog(false);
              proceedWithOrder(true);
            }}
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
