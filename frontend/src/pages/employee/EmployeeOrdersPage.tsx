import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  ShoppingBag,
  ExpandMore,
  ExpandLess,
  WarningAmber,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAllOrders } from '../../hooks/useOrders';
import { useUpdateOrderStatus } from '../../hooks/useEmployeeOrders';
import { useAuthStore } from '../../store/authStore';
import type { OrderDTO } from '../../api/types';

const EmployeeOrdersPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { user } = useAuthStore();
  const isWarehouseWorker = user?.role === 'MAGAZYNIER';
  const isSalesperson = user?.role === 'SPRZEDAWCA';
  const isManager = user?.role === 'KIEROWNIK';
  const canUpdateOrders = user?.role === 'SPRZEDAWCA' || user?.role === 'KIEROWNIK' || user?.role === 'MAGAZYNIER';

  // Dla pracівників pokazуємо tylko zamówienia ich sklepu, dla kierownika wszystkie
  const { data: ordersPage, isLoading, error } = useAllOrders({
    page,
    size: rowsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(!isManager && user?.storeId && { storeId: user.storeId }),
  } as any);

  const updateStatus = useUpdateOrderStatus();

  const orders = ordersPage?.content || [];
  const totalElements = ordersPage?.totalElements || 0;

  // Filter by search query client-side
  const filteredOrders = orders.filter((order: OrderDTO) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toString().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.pickupStoreName.toLowerCase().includes(query)
    );
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: 'W_REALIZACJI' | 'GOTOWE_DO_ODBIORU' | 'ZAKONCZONE' | 'ANULOWANE'
  ) => {
    console.log('Updating order status:', { orderId, newStatus });
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      console.log('Status updated successfully');
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';

      if (errorMessage.includes('Not enough items')) {
        alert('Cannot fulfill order: Insufficient stock.\n\n' + errorMessage.replace('java.lang.IllegalStateException: ', ''));
      } else {
        alert('Failed to update order: ' + errorMessage);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      NOWE: 'warning',
      W_REALIZACJI: 'info',
      GOTOWE_DO_ODBIORU: 'success',
      ZAKONCZONE: 'success',
      ANULOWANE: 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      NOWE: 'Nowe',
      W_REALIZACJI: 'W realizacji',
      GOTOWE_DO_ODBIORU: 'Gotowe do odbioru',
      ZAKONCZONE: 'Zakończone',
      ANULOWANE: 'Anulowane',
    };
    return statusLabels[status] || status;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <ShoppingBag fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage customer orders
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Order ID, Customer, Store..."
            sx={{ minWidth: 250, flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Wszystkie statusy</MenuItem>
              <MenuItem value="NOWE">Nowe</MenuItem>
              <MenuItem value="W_REALIZACJI">W realizacji</MenuItem>
              <MenuItem value="GOTOWE_DO_ODBIORU">Gotowe do odbioru</MenuItem>
              <MenuItem value="ZAKONCZONE">Zakończone</MenuItem>
              <MenuItem value="ANULOWANE">Anulowane</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Orders Table */}
      {error ? (
        <Alert severity="error">Failed to load orders. Please try again later.</Alert>
      ) : isLoading ? (
        <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : filteredOrders.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={30}></TableCell>
                  <TableCell width={50}></TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Pickup Store</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  {canUpdateOrders && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order: OrderDTO) => {
                  const isExpanded = expandedRow === order.orderId;

                  return (
                    <>
                      <TableRow key={order.orderId} hover>
                        <TableCell>
                          {order.hasShortage && (
                            <Tooltip title="Requires Restock - Insufficient Inventory">
                              <WarningAmber color="warning" />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : order.orderId)
                            }
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">#{order.orderId}</Typography>
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {order.pickupStoreName}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {order.pickupStoreCity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {order.totalAmount.toFixed(2)} PLN
                          </Typography>
                        </TableCell>
                        {canUpdateOrders && (
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                              {/* Magazynier: NOWE -> GOTOWE_DO_ODBIORU */}
                              {order.status === 'NOWE' && isWarehouseWorker && (
                                <Tooltip title="Przygotuj zamówienie">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      handleStatusUpdate(order.orderId, 'GOTOWE_DO_ODBIORU')
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    Przygotuj
                                  </Button>
                                </Tooltip>
                              )}

                              {/* Sprzedawca/Kierownik: NOWE -> W_REALIZACJI */}
                              {order.status === 'NOWE' && (isSalesperson || user?.role === 'KIEROWNIK') && (
                                <Tooltip title="Rozpocznij realizację">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                      handleStatusUpdate(order.orderId, 'W_REALIZACJI')
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    Realizuj
                                  </Button>
                                </Tooltip>
                              )}

                              {/* W_REALIZACJI -> GOTOWE_DO_ODBIORU lub ANULOWANE */}
                              {order.status === 'W_REALIZACJI' && (
                                <>
                                  <Tooltip title="Oznacz jako gotowe">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      onClick={() =>
                                        handleStatusUpdate(order.orderId, 'GOTOWE_DO_ODBIORU')
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      Gotowe
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Anuluj">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() =>
                                        handleStatusUpdate(order.orderId, 'ANULOWANE')
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      Anuluj
                                    </Button>
                                  </Tooltip>
                                </>
                              )}

                              {/* Sprzedawca: GOTOWE_DO_ODBIORU -> ZAKONCZONE (klient odebrał i zapłacił) */}
                              {order.status === 'GOTOWE_DO_ODBIORU' && (isSalesperson || user?.role === 'KIEROWNIK') && (
                                <>
                                  <Tooltip title="Klient odebrał i zapłacił">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() =>
                                        handleStatusUpdate(order.orderId, 'ZAKONCZONE')
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      Zakończ sprzedaż
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Anuluj">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() =>
                                        handleStatusUpdate(order.orderId, 'ANULOWANE')
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      Anuluj
                                    </Button>
                                  </Tooltip>
                                </>
                              )}

                              {(order.status === 'ZAKONCZONE' || order.status === 'ANULOWANE') && (
                                <Typography variant="caption" color="text.secondary">
                                  Zakończone
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={canUpdateOrders ? 8 : 7} sx={{ p: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Typography variant="h6" gutterBottom>
                                Order Items
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.lines.map((line) => (
                                    <TableRow key={line.orderLineId}>
                                      <TableCell>{line.productName}</TableCell>
                                      <TableCell align="right">{line.quantity}</TableCell>
                                      <TableCell align="right">
                                        {line.priceAtOrder.toFixed(2)} PLN
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography fontWeight="bold">
                                          {line.lineTotal.toFixed(2)} PLN
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} align="right">
                                      <Typography variant="h6">Total:</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="h6" fontWeight="bold">
                                        {order.totalAmount.toFixed(2)} PLN
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}
    </Container>
  );
};

export default EmployeeOrdersPage;
