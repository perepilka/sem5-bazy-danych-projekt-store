import { useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useEmployees,
  useCreateEmployee,
  useToggleEmployeeStatus,
  useDeleteEmployee,
} from '../../hooks/useEmployees';
import { useStores } from '../../hooks/useStores';

const EmployeesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    storeId: '',
    firstName: '',
    lastName: '',
    position: '',
    login: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: employeesPage, isLoading, error: fetchError } = useEmployees({ page, size: rowsPerPage });
  const { data: storesPage } = useStores({ page: 0, size: 100 });
  const createMutation = useCreateEmployee();
  const toggleStatusMutation = useToggleEmployeeStatus();
  const deleteMutation = useDeleteEmployee();

  const employees = employeesPage?.content || [];
  const stores = storesPage?.content || [];
  const totalElements = employeesPage?.totalElements || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setFormData({
      storeId: '',
      firstName: '',
      lastName: '',
      position: '',
      login: '',
      password: '',
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEmployee = async () => {
    try {
      setError(null);
      await createMutation.mutateAsync({
        storeId: parseInt(formData.storeId),
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        login: formData.login,
        password: formData.password,
      });
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleToggleStatus = async (id: number) => {
    console.log('Toggle status for employee:', id);
    try {
      await toggleStatusMutation.mutateAsync(id);
      console.log('Toggle status success');
    } catch (err: any) {
      console.error('Failed to toggle employee status:', err);
      alert('Failed to toggle employee status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete employee ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert('Failed to delete employee. They may have associated transactions.');
      }
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'KIEROWNIK':
        return 'error';
      case 'SPRZEDAWCA':
        return 'primary';
      case 'MAGAZYNIER':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'KIEROWNIK':
        return 'Manager';
      case 'SPRZEDAWCA':
        return 'Salesperson';
      case 'MAGAZYNIER':
        return 'Warehouse Worker';
      default:
        return position;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <PeopleIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Employee Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage employee accounts and permissions
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          size="large"
        >
          Add Employee
        </Button>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load employees. Please try again later.
        </Alert>
      )}

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Login</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.employeeId} hover>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {employee.firstName} {employee.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPositionLabel(employee.position)}
                      color={getPositionColor(employee.position)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.storeName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {employee.login}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={employee.isActive ? <ActiveIcon /> : <BlockIcon />}
                      label={employee.isActive ? 'Active' : 'Blocked'}
                      color={employee.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={employee.isActive ? 'Block Account' : 'Activate Account'}>
                      <IconButton
                        color={employee.isActive ? 'warning' : 'success'}
                        size="small"
                        onClick={() => handleToggleStatus(employee.employeeId)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {employee.isActive ? <BlockIcon /> : <ActiveIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Employee">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          handleDeleteEmployee(
                            employee.employeeId,
                            `${employee.firstName} ${employee.lastName}`
                          )
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* Create Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Position</InputLabel>
              <Select
                value={formData.position}
                label="Position"
                onChange={(e) => handleInputChange('position', e.target.value)}
              >
                <MenuItem value="KIEROWNIK">Manager</MenuItem>
                <MenuItem value="SPRZEDAWCA">Salesperson</MenuItem>
                <MenuItem value="MAGAZYNIER">Warehouse Worker</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Store</InputLabel>
              <Select
                value={formData.storeId}
                label="Store"
                onChange={(e) => handleInputChange('storeId', e.target.value)}
              >
                {stores.map((store: any) => (
                  <MenuItem key={store.storeId} value={store.storeId}>
                    {store.city} - {store.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Login"
              value={formData.login}
              onChange={(e) => handleInputChange('login', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              fullWidth
              required
              helperText="Minimum 6 characters"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateEmployee}
            variant="contained"
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.position ||
              !formData.storeId ||
              !formData.login ||
              !formData.password ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeesPage;
