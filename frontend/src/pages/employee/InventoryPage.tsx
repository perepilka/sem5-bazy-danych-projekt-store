import { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Warning, CheckCircle, Inventory as InventoryIcon, LocalShipping } from '@mui/icons-material';
import { useStores } from '../../hooks/useStores';
import { useStoreInventory } from '../../hooks/useInventory';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../../api/endpoints/stores';
import type { LowStockItemDTO } from '../../api/types';

const InventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeIdParam = searchParams.get('storeId');
  
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
    storeIdParam ? parseInt(storeIdParam) : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [autoDeliveryDialogOpen, setAutoDeliveryDialogOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItemDTO[]>([]);

  const queryClient = useQueryClient();
  const { data: storesPage, isLoading: storesLoading } = useStores({ page: 0, size: 100 });
  const { data: inventory, isLoading: inventoryLoading, error } = useStoreInventory(selectedStoreId);

  const stores = storesPage?.content || [];

  // Mutation for checking low stock
  const checkLowStockMutation = useMutation({
    mutationFn: (storeId: number) => storesApi.getLowStockItems(storeId),
    onSuccess: (data) => {
      setLowStockItems(data);
      setAutoDeliveryDialogOpen(true);
    },
  });

  // Mutation for creating auto-delivery
  const createAutoDeliveryMutation = useMutation({
    mutationFn: (storeId: number) => storesApi.createAutoDelivery(storeId),
    onSuccess: () => {
      setAutoDeliveryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['storeInventory', selectedStoreId] });
      alert('Auto-delivery created successfully! Check the Deliveries page to process it.');
    },
    onError: (error: any) => {
      alert(`Failed to create auto-delivery: ${error.response?.data?.message || error.message}`);
    },
  });

  // Update URL when store selection changes
  useEffect(() => {
    if (selectedStoreId) {
      setSearchParams({ storeId: selectedStoreId.toString() });
    } else {
      setSearchParams({});
    }
  }, [selectedStoreId, setSearchParams]);

  // Filter inventory based on search
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    
    return inventory.filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  // Paginate filtered results
  const paginatedInventory = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredInventory.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredInventory, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStockStatus = (availableCount: number) => {
    if (availableCount === 0) {
      return { label: 'Out of Stock', color: 'error' as const, icon: <Warning fontSize="small" /> };
    }
    if (availableCount <= 5) {
      return { label: 'Low Stock', color: 'warning' as const, icon: <Warning fontSize="small" /> };
    }
    return { label: 'In Stock', color: 'success' as const, icon: <CheckCircle fontSize="small" /> };
  };

  if (storesLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <InventoryIcon fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage product stock levels across stores
          </Typography>
        </Box>
      </Box>

      {/* Store Selection and Search */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Store</InputLabel>
            <Select
              value={selectedStoreId || ''}
              label="Select Store"
              onChange={(e) => {
                setSelectedStoreId(Number(e.target.value) || null);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <em>Select a store</em>
              </MenuItem>
              {stores.map((store: any) => (
                <MenuItem key={store.storeId} value={store.storeId}>
                  {store.city} - {store.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Search Products"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Search by product or category..."
            sx={{ flexGrow: 1, minWidth: 250 }}
            disabled={!selectedStoreId}
          />

          <Button
            variant="outlined"
            color="warning"
            startIcon={<LocalShipping />}
            onClick={() => selectedStoreId && checkLowStockMutation.mutate(selectedStoreId)}
            disabled={!selectedStoreId || checkLowStockMutation.isPending}
            sx={{ minWidth: 200 }}
          >
            {checkLowStockMutation.isPending ? 'Checking...' : 'Check Low Stock'}
          </Button>
        </Box>
      </Paper>

      {/* Inventory Table */}
      {!selectedStoreId ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please select a store to view inventory
          </Typography>
        </Paper>
      ) : error ? (
        <Alert severity="error">
          Failed to load inventory data. Please try again later.
        </Alert>
      ) : inventoryLoading ? (
        <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : filteredInventory.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No products found matching your search' : 'No inventory data available'}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Available</TableCell>
                  <TableCell align="center">On Display</TableCell>
                  <TableCell align="center">Reserved</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInventory.map((item) => {
                  const status = getStockStatus(item.availableCount);
                  return (
                    <TableRow key={item.productId} hover>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{item.productName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.categoryName} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          fontWeight="bold"
                          color={item.availableCount <= 5 ? 'error' : 'text.primary'}
                        >
                          {item.availableCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.onDisplayCount}</TableCell>
                      <TableCell align="center">{item.reservedCount}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">{item.totalCount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={status.label}>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            icon={status.icon}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredInventory.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      {/* Low Stock Dialog */}
      <Dialog open={autoDeliveryDialogOpen} onClose={() => setAutoDeliveryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Low Stock Items</DialogTitle>
        <DialogContent>
          {lowStockItems.length === 0 ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              All products are sufficiently stocked!
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2, mt: 2 }}>
                Found {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} below threshold
              </Alert>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Threshold</TableCell>
                      <TableCell align="right">Minimum Stock</TableCell>
                      <TableCell align="right">Order Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <Typography fontWeight="medium">{item.productName}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error" fontWeight="bold">
                            {item.currentStock}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.lowStockThreshold}</TableCell>
                        <TableCell align="right">{item.minimumStock}</TableCell>
                        <TableCell align="right">
                          <Chip label={item.quantityNeeded} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoDeliveryDialogOpen(false)}>Cancel</Button>
          {lowStockItems.length > 0 && (
            <Button
              variant="contained"
              onClick={() => selectedStoreId && createAutoDeliveryMutation.mutate(selectedStoreId)}
              disabled={createAutoDeliveryMutation.isPending}
            >
              {createAutoDeliveryMutation.isPending ? 'Creating...' : 'Create Auto-Delivery'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryPage;
