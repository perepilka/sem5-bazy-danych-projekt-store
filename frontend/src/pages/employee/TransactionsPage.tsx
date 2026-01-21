import { useState, Fragment } from 'react';
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
  TextField,
} from '@mui/material';
import {
  Receipt,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuthStore } from '../../store/authStore';
import type { TransactionDTO } from '../../hooks/useTransactions';

const TransactionsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { user } = useAuthStore();
  const isManager = user?.role === 'KIEROWNIK';

  const { data: transactionsPage, isLoading, error } = useTransactions({
    page,
    size: rowsPerPage,
    ...(!isManager && user?.storeId && { storeId: user.storeId }),
  } as any);

  const transactions = transactionsPage?.content || [];
  const totalElements = transactionsPage?.totalElements || 0;

  // Filter by search query client-side
  const filteredTransactions = transactions.filter((transaction: TransactionDTO) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      transaction.transactionId.toString().includes(query) ||
      transaction.storeName.toLowerCase().includes(query) ||
      transaction.customerName?.toLowerCase().includes(query) ||
      transaction.employeeName?.toLowerCase().includes(query)
    );
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Receipt fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all store transactions and sales
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Transaction ID, Store, Customer, Employee..."
          fullWidth
        />
      </Paper>

      {/* Transactions Table */}
      {error ? (
        <Alert severity="error">Failed to load transactions. Please try again later.</Alert>
      ) : isLoading ? (
        <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : filteredTransactions.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No transactions found
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction: TransactionDTO) => {
                  const isExpanded = expandedRow === transaction.transactionId;

                  return (
                    <Fragment key={transaction.transactionId}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : transaction.transactionId)
                            }
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            #{transaction.transactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.storeName}</TableCell>
                        <TableCell>
                          {transaction.customerName || (
                            <Typography color="text.secondary" fontStyle="italic">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.employeeName || (
                            <Typography color="text.secondary" fontStyle="italic">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Chip label={transaction.transactionType} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {transaction.totalAmount.toFixed(2)} PLN
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Typography variant="h6" gutterBottom>
                                Transaction Items
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Item ID</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {transaction.items.map((item) => (
                                    <TableRow key={item.txItemId}>
                                      <TableCell>#{item.itemId}</TableCell>
                                      <TableCell>{item.productName}</TableCell>
                                      <TableCell align="right">
                                        <Typography fontWeight="bold">
                                          {item.priceSold.toFixed(2)} PLN
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={2} align="right">
                                      <Typography variant="h6">Total:</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="h6" fontWeight="bold">
                                        {transaction.totalAmount.toFixed(2)} PLN
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
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

export default TransactionsPage;
