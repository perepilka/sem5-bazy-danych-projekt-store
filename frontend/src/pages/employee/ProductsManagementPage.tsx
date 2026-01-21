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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { productsApi } from '../../api/endpoints/products';
import { categoriesApi } from '../../api/endpoints/categories';
import type { ProductDTO, CategoryDTO } from '../../api/types';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    lowStockThreshold: '10',
    minimumStock: '20',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getProducts({ page: 0, size: 100 }),
        categoriesApi.getCategories(),
      ]);
      setProducts(productsData.content);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        categoryId: parseInt(formData.categoryId),
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        minimumStock: parseInt(formData.minimumStock) || 20,
      };

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.productId, data);
      } else {
        await productsApi.createProduct(data);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', basePrice: '', categoryId: '', lowStockThreshold: '10', minimumStock: '20' });
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleEdit = (product: ProductDTO) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice.toString(),
      categoryId: product.categoryId?.toString() || '',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      minimumStock: product.minimumStock?.toString() || '20',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.deleteProduct(id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', basePrice: '', categoryId: '', lowStockThreshold: '10', minimumStock: '20' });
    setShowModal(true);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProducts = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <InventoryIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Products Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage product catalog across the network
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Base Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.productId} hover>
                <TableCell>{product.productId}</TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{product.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.categoryName} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">{product.basePrice.toFixed(2)} PLN</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.productId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={products.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {showModal && (
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                fullWidth
              >
                <MenuItem value="">Select category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Base Price (PLN)"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Low Stock Threshold"
                type="number"
                inputProps={{ min: '0', step: '1' }}
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                helperText="Alert when stock falls below this level"
                fullWidth
              />
              <TextField
                label="Minimum Stock"
                type="number"
                inputProps={{ min: '0', step: '1' }}
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                helperText="Target stock level for auto-replenishment"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
