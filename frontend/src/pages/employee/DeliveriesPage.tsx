import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping,
  Add,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useDeliveries, useUpdateDeliveryStatus, useCreateDelivery } from '../../hooks/useDeliveries';
import { useProducts } from '../../hooks/useProducts';
import { useStores } from '../../hooks/useStores';
import { useAuthStore } from '../../store/authStore';
import { deliveriesApi } from '../../api/endpoints/deliveries';
import type { DeliveryDTO } from '../../hooks/useDeliveries';

const DeliveriesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'suggestions'>('all');

  // Prefill data for creating delivery from suggestion
  const [prefillData, setPrefillData] = useState<{
    supplierName?: string;
    deliveryDate?: string;
    lines?: Array<{ productId: number, quantity: number, purchasePrice: number, storeId: number }>;
  } | null>(null);

  const { user } = useAuthStore();
  const canManageDeliveries = user?.role === 'MAGAZYNIER' || user?.role === 'KIEROWNIK';

  // Fetch all deliveries
  const { data: deliveriesPage, isLoading, error } = useDeliveries({
    page,
    size: rowsPerPage,
    status: statusFilter || undefined,
  });

  // Fetch suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['restockSuggestions'],
    queryFn: deliveriesApi.getRestockSuggestions,
    enabled: !!canManageDeliveries,
  });

  const updateStatus = useUpdateDeliveryStatus();

  const deliveries = deliveriesPage?.content || [];
  const totalElements = deliveriesPage?.totalElements || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (deliveryId: number, newStatus: 'W_TRAKCIE' | 'ZREALIZOWANA' | 'ANULOWANA') => {
    try {
      await updateStatus.mutateAsync({ id: deliveryId, status: newStatus });
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  };

  const handleCreateFromSuggestion = (suggestion: import('../../api/types').RestockSuggestionDTO) => {
    setPrefillData({
      supplierName: `Restock for ${suggestion.storeName}`,
      deliveryDate: new Date().toISOString().split('T')[0],
      lines: suggestion.neededProducts.map(p => ({
        productId: p.productId,
        quantity: p.quantityNeeded,
        purchasePrice: 0,
        storeId: suggestion.storeId,
      }))
    });
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setPrefillData(null);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      OCZEKUJACA: 'warning',
      W_TRAKCIE: 'info',
      ZREALIZOWANA: 'success',
      ANULOWANA: 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ZREALIZOWANA':
        return <CheckCircle fontSize="small" />;
      case 'ANULOWANA':
        return <Cancel fontSize="small" />;
      case 'W_TRAKCIE':
        return <HourglassEmpty fontSize="small" />;
      default:
        return undefined;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <LocalShipping fontSize="large" color="primary" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Deliveries Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage inventory deliveries
            </Typography>
          </Box>
        </Box>
        {canManageDeliveries && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Delivery
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Button
          onClick={() => setActiveTab('all')}
          variant={activeTab === 'all' ? 'contained' : 'text'}
          sx={{ mr: 2 }}
        >
          All Deliveries
        </Button>
        {canManageDeliveries && (
          <Button
            onClick={() => setActiveTab('suggestions')}
            variant={activeTab === 'suggestions' ? 'contained' : 'text'}
            color="warning"
          >
            Restock Suggestions ({suggestions?.length || 0})
          </Button>
        )}
      </Box>

      {activeTab === 'suggestions' ? (
        <RestockSuggestionsList
          suggestions={suggestions || []}
          onCreateDelivery={handleCreateFromSuggestion}
        />
      ) : (
        <>
          {/* Filters */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
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
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="PRZYJETA">Przyjęta</MenuItem>
                  <MenuItem value="W_TRAKCIE">W Trakcie</MenuItem>
                  <MenuItem value="ZREALIZOWANA">Zrealizowana</MenuItem>
                  <MenuItem value="ANULOWANA">Anulowana</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Deliveries Table */}
          {error ? (
            <Alert severity="error">Failed to load deliveries. Please try again later.</Alert>
          ) : isLoading ? (
            <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Paper>
          ) : deliveries.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No deliveries found
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}></TableCell>
                      <TableCell>Delivery ID</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Delivery Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total Value</TableCell>
                      {canManageDeliveries && <TableCell align="center">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveries.map((delivery: DeliveryDTO) => {
                      const totalValue = delivery.lines.reduce(
                        (sum, line) => sum + line.totalPrice,
                        0
                      );
                      const isExpanded = expandedRow === delivery.deliveryId;

                      return (
                        <>
                          <TableRow key={delivery.deliveryId} hover>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setExpandedRow(isExpanded ? null : delivery.deliveryId)
                                }
                              >
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </TableCell>
                            <TableCell>#{delivery.deliveryId}</TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {delivery.supplierName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {format(new Date(delivery.deliveryDate), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={delivery.status}
                                color={getStatusColor(delivery.status)}
                                size="small"
                                icon={getStatusIcon(delivery.status)}
                              />
                            </TableCell>
                            <TableCell>{delivery.lines.length}</TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                {totalValue.toFixed(2)} PLN
                              </Typography>
                            </TableCell>
                            {canManageDeliveries && (
                              <TableCell align="center">
                                {delivery.status === 'OCZEKUJACA' && (
                                  <Tooltip title="Start Delivery">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        handleStatusUpdate(delivery.deliveryId, 'W_TRAKCIE')
                                      }
                                      disabled={updateStatus.isPending}
                                    >
                                      Start
                                    </Button>
                                  </Tooltip>
                                )}
                                {delivery.status === 'W_TRAKCIE' && (
                                  <Box display="flex" gap={1} justifyContent="center">
                                    <Tooltip title="Complete Delivery">
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        onClick={() =>
                                          handleStatusUpdate(delivery.deliveryId, 'ZREALIZOWANA')
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        Complete
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Cancel Delivery">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() =>
                                          handleStatusUpdate(delivery.deliveryId, 'ANULOWANA')
                                        }
                                        disabled={updateStatus.isPending}
                                      >
                                        Cancel
                                      </Button>
                                    </Tooltip>
                                  </Box>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={canManageDeliveries ? 8 : 7} sx={{ p: 0 }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Typography variant="h6" gutterBottom>
                                    Delivery Items
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Purchase Price</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                        {delivery.lines[0]?.storeName && <TableCell>Store</TableCell>}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {delivery.lines.map((line) => (
                                        <TableRow key={line.deliveryLineId}>
                                          <TableCell>{line.productName}</TableCell>
                                          <TableCell align="right">{line.quantity}</TableCell>
                                          <TableCell align="right">
                                            {line.purchasePrice.toFixed(2)} PLN
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography fontWeight="bold">
                                              {line.totalPrice.toFixed(2)} PLN
                                            </Typography>
                                          </TableCell>
                                          {line.storeName && (
                                            <TableCell>{line.storeName}</TableCell>
                                          )}
                                        </TableRow>
                                      ))}
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
        </>
      )}

      <CreateDeliveryDialog
        open={createDialogOpen}
        onClose={handleCloseDialog}
        prefillData={prefillData}
      />
    </Container>
  );
};

// Suggestions List Component
const RestockSuggestionsList = ({
  suggestions,
  onCreateDelivery
}: {
  suggestions: import('../../api/types').RestockSuggestionDTO[],
  onCreateDelivery: (suggestion: import('../../api/types').RestockSuggestionDTO) => void
}) => {
  if (suggestions.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No stock shortages found. Inventory is healthy!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {suggestions.map((suggestion) => (
        <Paper key={suggestion.storeId} elevation={3} sx={{ p: 3, borderLeft: '6px solid #ed6c02' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {suggestion.storeName}
              </Typography>
              <Typography color="text.secondary">
                {suggestion.storeCity}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              onClick={() => onCreateDelivery(suggestion)}
            >
              Create Restock Delivery
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Quantity Needed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suggestion.neededProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell align="right">{product.currentStock}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {product.quantityNeeded}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
};

// Create Delivery Dialog Component
const CreateDeliveryDialog = ({
  open,
  onClose,
  prefillData
}: {
  open: boolean;
  onClose: () => void;
  prefillData?: {
    supplierName?: string;
    deliveryDate?: string;
    lines?: Array<{ productId: number, quantity: number, purchasePrice: number, storeId: number }>;
  } | null;
}) => {
  const [supplierName, setSupplierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [lines, setLines] = useState<Array<{
    productId: number;
    quantity: number;
    purchasePrice: number;
    storeId: number;
  }>>([{ productId: 0, quantity: 1, purchasePrice: 0, storeId: 0 }]);

  // Apply prefill data when dialog opens
  useEffect(() => {
    if (open && prefillData) {
      if (prefillData.supplierName) setSupplierName(prefillData.supplierName);
      if (prefillData.deliveryDate) setDeliveryDate(prefillData.deliveryDate);
      if (prefillData.lines) setLines(prefillData.lines);
    } else if (open && !prefillData) {
      setSupplierName('');
      setDeliveryDate('');
      setLines([{ productId: 0, quantity: 1, purchasePrice: 0, storeId: 0 }]);
    }
  }, [open, prefillData]);

  const { data: productsPage } = useProducts({ size: 100 });
  const { data: storesPage } = useStores({ size: 100 });
  const createDelivery = useCreateDelivery();

  const products = productsPage?.content || [];
  const stores = storesPage?.content || [];

  const handleSubmit = async () => {
    console.log('Creating delivery:', { supplierName, deliveryDate, lines });

    if (!supplierName || !deliveryDate || lines.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const filteredLines = lines.filter(l => l.productId > 0 && l.storeId > 0);
    if (filteredLines.length === 0) {
      alert('Please add at least one valid delivery line');
      return;
    }

    try {
      await createDelivery.mutateAsync({
        supplierName,
        deliveryDate,
        lines: filteredLines,
      });
      console.log('Delivery created successfully');
      onClose();
      // Reset form
      setSupplierName('');
      setDeliveryDate('');
      setLines([{ productId: 0, quantity: 1, purchasePrice: 0, storeId: 0 }]);
    } catch (error: any) {
      console.error('Failed to create delivery:', error);
      alert('Failed to create delivery: ' + (error.response?.data?.message || error.message));
    }
  };

  const addLine = () => {
    setLines([...lines, { productId: 0, quantity: 1, purchasePrice: 0, storeId: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Delivery</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Delivery Date"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Delivery Items
          </Typography>

          {lines.map((line, index) => (
            <Paper key={index} sx={{ p: 2 }}>
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={line.productId}
                    label="Product"
                    onChange={(e) => updateLine(index, 'productId', e.target.value)}
                  >
                    <MenuItem value={0}>Select Product</MenuItem>
                    {products.map((p: any) => (
                      <MenuItem key={p.productId} value={p.productId}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Store</InputLabel>
                  <Select
                    value={line.storeId}
                    label="Store"
                    onChange={(e) => updateLine(index, 'storeId', e.target.value)}
                  >
                    <MenuItem value={0}>Select Store</MenuItem>
                    {stores.map((s: any) => (
                      <MenuItem key={s.storeId} value={s.storeId}>
                        {s.city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />

                <TextField
                  label="Purchase Price"
                  type="number"
                  value={line.purchasePrice}
                  onChange={(e) => updateLine(index, 'purchasePrice', Number(e.target.value))}
                  sx={{ width: 130 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />

                {lines.length > 1 && (
                  <Button
                    color="error"
                    onClick={() => removeLine(index)}
                    variant="outlined"
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Paper>
          ))}

          <Button onClick={addLine} variant="outlined">
            + Add Item
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createDelivery.isPending || !supplierName || !deliveryDate}
        >
          {createDelivery.isPending ? 'Creating...' : 'Create Delivery'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveriesPage;
