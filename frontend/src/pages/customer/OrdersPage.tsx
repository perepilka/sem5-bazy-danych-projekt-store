import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ShoppingBag,
  ExpandMore,
  ExpandLess,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
  Store,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useMyOrders } from '../../hooks/useOrders';
import type { OrderDTO } from '../../api/types';

const OrdersPage = () => {
  const location = useLocation();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: ordersPage, isLoading, error } = useMyOrders({ page: 0, size: 100 });

  const orders = ordersPage?.content || [];

  // Show success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getStatusColor = (status: string): 'default' | 'warning' | 'info' | 'success' | 'error' => {
    const statusMap: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
      NOWE: 'warning',
      W_REALIZACJI: 'info',
      GOTOWE_DO_ODBIORU: 'primary',
      ZAKONCZONE: 'success',
      ANULOWANE: 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, JSX.Element> = {
      NOWE: <Pending />,
      W_REALIZACJI: <LocalShipping />,
      GOTOWE_DO_ODBIORU: <Store />,
      ZAKONCZONE: <CheckCircle />,
      ANULOWANE: <Cancel />,
    };
    return iconMap[status] || <Pending />;
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      NOWE: 'Nowe zamówienie',
      W_REALIZACJI: 'W realizacji',
      GOTOWE_DO_ODBIORU: 'Gotowe do odbioru',
      ZAKONCZONE: 'Zakończone',
      ANULOWANE: 'Anulowane',
    };
    return textMap[status] || status;
  };

  const handleShowDetails = (order: OrderDTO) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Nie udało się załadować zamówień. Spróbuj ponownie później.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <ShoppingBag fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Moje zamówienia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historia twoich zamówień
          </Typography>
        </Box>
      </Box>

      {orders.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak zamówień
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nie masz jeszcze żadnych zamówień
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order: OrderDTO) => {
            const isExpanded = expandedOrder === order.orderId;

            return (
              <Grid item xs={12} key={order.orderId}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Zamówienie #{order.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(order.orderDate), 'dd.MM.yyyy HH:mm')}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          size="medium"
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Punkt odbioru
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {order.pickupStoreName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.pickupStoreCity}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Wartość zamówienia
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {order.totalAmount.toFixed(2)} PLN
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box mt={2} display="flex" gap={1} alignItems="center">
                      <Button
                        size="small"
                        endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.orderId)
                        }
                      >
                        {isExpanded ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleShowDetails(order)}
                      >
                        Pełne szczegóły
                      </Button>
                    </Box>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Produkty w zamówieniu:
                        </Typography>
                        {order.lines.map((line) => (
                          <Box
                            key={line.orderLineId}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={1}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {line.productName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {line.quantity} x {line.priceAtOrder.toFixed(2)} PLN
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                              {line.lineTotal.toFixed(2)} PLN
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            Razem:
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {order.totalAmount.toFixed(2)} PLN
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Zamówienie #{selectedOrder.orderId}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedOrder.status)}
                  label={getStatusText(selectedOrder.status)}
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Data zamówienia
                </Typography>
                <Typography variant="body1">
                  {format(new Date(selectedOrder.orderDate), 'dd MMMM yyyy, HH:mm')}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Punkt odbioru
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedOrder.pickupStoreName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.pickupStoreCity}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Produkty
              </Typography>
              {selectedOrder.lines.map((line) => (
                <Box
                  key={line.orderLineId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1.5}
                >
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {line.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {line.quantity} x {line.priceAtOrder.toFixed(2)} PLN
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {line.lineTotal.toFixed(2)} PLN
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Suma całkowita:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {selectedOrder.totalAmount.toFixed(2)} PLN
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Zamknij</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrdersPage;
