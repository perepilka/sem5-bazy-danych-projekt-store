import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalAmount, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add some products to get started!
          </Typography>
          <Button variant="contained" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Browse Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.categoryName}
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                    {formatPrice(item.basePrice)} each
                  </Typography>
                </Box>

                <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center"
                  justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>

                  <Typography 
                    variant="h6" 
                    sx={{ minWidth: { xs: 80, sm: 100 }, textAlign: 'right' }}
                  >
                    {formatPrice(item.basePrice * item.quantity)}
                  </Typography>

                  <IconButton
                    color="error"
                    onClick={() => removeItem(item.productId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total Items:</Typography>
              <Typography variant="h6">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5">Total Amount:</Typography>
              <Typography variant="h5" color="primary">
                {formatPrice(getTotalAmount())}
              </Typography>
            </Stack>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mt: 2 }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(ROUTES.CHECKOUT)}
              >
                Proceed to Checkout
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CartPage;
