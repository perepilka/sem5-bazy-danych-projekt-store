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
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
} from '@mui/material';
import {
  AssignmentReturn,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useReturns, useUpdateReturnStatus } from '../../hooks/useReturns';
import { useAuthStore } from '../../store/authStore';
import type { ReturnDTO } from '../../hooks/useReturns';

const ReturnsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { user } = useAuthStore();
  const canUpdateReturns = user?.role === 'SPRZEDAWCA' || user?.role === 'KIEROWNIK';

  const { data: returnsPage, isLoading, error } = useReturns({
    page,
    size: rowsPerPage,
    ...(statusFilter && { status: statusFilter }),
  } as any);

  const updateStatus = useUpdateReturnStatus();

  const returns = returnsPage?.content || [];
  const totalElements = returnsPage?.totalElements || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (
    returnId: number,
    newStatus: 'ROZPATRYWANY' | 'PRZYJETY' | 'ODRZUCONY'
  ) => {
    try {
      await updateStatus.mutateAsync({ id: returnId, status: newStatus });
    } catch (error) {
      console.error('Failed to update return status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      ROZPATRYWANY: 'warning',
      PRZYJETY: 'success',
      ODRZUCONY: 'error',
    };
    return statusMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRZYJETY':
        return <CheckCircle fontSize="small" />;
      case 'ODRZUCONY':
        return <Cancel fontSize="small" />;
      case 'ROZPATRYWANY':
        return <HourglassEmpty fontSize="small" />;
      default:
        return undefined;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AssignmentReturn fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Returns Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process and manage customer returns
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
            <MenuItem value="ROZPATRYWANY">Rozpatrywany</MenuItem>
            <MenuItem value="PRZYJETY">Przyjęty</MenuItem>
            <MenuItem value="ODRZUCONY">Odrzucony</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Returns Table */}
      {error ? (
        <Alert severity="error">Failed to load returns. Please try again later.</Alert>
      ) : isLoading ? (
        <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : returns.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentReturn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No returns found
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Return ID</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Items</TableCell>
                  {canUpdateReturns && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {returns.map((returnItem: ReturnDTO) => {
                  const isExpanded = expandedRow === returnItem.returnId;

                  return (
                    <>
                      <TableRow key={returnItem.returnId} hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : returnItem.returnId)
                            }
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">#{returnItem.returnId}</Typography>
                        </TableCell>
                        <TableCell>#{returnItem.transactionId}</TableCell>
                        <TableCell>
                          {format(new Date(returnItem.returnDate), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ maxWidth: 200 }} noWrap>
                            {returnItem.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={returnItem.status}
                            color={getStatusColor(returnItem.status)}
                            size="small"
                            icon={getStatusIcon(returnItem.status)}
                          />
                        </TableCell>
                        <TableCell>{returnItem.items.length}</TableCell>
                        {canUpdateReturns && (
                          <TableCell align="center">
                            {returnItem.status === 'ROZPATRYWANY' && (
                              <Box display="flex" gap={1} justifyContent="center">
                                <Tooltip title="Accept Return">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      handleStatusUpdate(returnItem.returnId, 'PRZYJETY')
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    Accept
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Reject Return">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() =>
                                      handleStatusUpdate(returnItem.returnId, 'ODRZUCONY')
                                    }
                                    disabled={updateStatus.isPending}
                                  >
                                    Reject
                                  </Button>
                                </Tooltip>
                              </Box>
                            )}
                            {(returnItem.status === 'PRZYJETY' || returnItem.status === 'ODRZUCONY') && (
                              <Typography variant="caption" color="text.secondary">
                                Processed
                              </Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={canUpdateReturns ? 8 : 7} sx={{ p: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Typography variant="h6" gutterBottom>
                                Return Details
                              </Typography>
                              <Box mb={2}>
                                <Typography variant="body2" color="text.secondary">
                                  Reason:
                                </Typography>
                                <Typography variant="body1">{returnItem.reason}</Typography>
                              </Box>
                              <Typography variant="h6" gutterBottom>
                                Returned Items
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Item ID</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Condition</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {returnItem.items.map((item) => (
                                    <TableRow key={item.returnItemId}>
                                      <TableCell>#{item.itemId}</TableCell>
                                      <TableCell>{item.productName}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={item.conditionCheck}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </TableCell>
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
    </Container>
  );
};

export default ReturnsPage;
