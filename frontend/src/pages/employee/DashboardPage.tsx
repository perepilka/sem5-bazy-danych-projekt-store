import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  AttachMoney,
  Store,
  Inventory,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import { useDashboardStats, useRecentOrders, useRecentTransactions } from '../../hooks/useDashboard';
import { format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const getStatusColor = (status: string) => {
  const statusMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
    OCZEKUJACY: 'warning',
    W_REALIZACJI: 'info',
    ZREALIZOWANY: 'success',
    ANULOWANY: 'error',
  };
  return statusMap[status] || 'default';
};

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(5);

  if (statsLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (statsError) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back! Here's what's happening in your store today.
      </Typography>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart sx={{ color: '#1976d2', fontSize: 32 }} />}
          color="#1976d2"
          subtitle="All time"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<AccessTime sx={{ color: '#ed6c02', fontSize: 32 }} />}
          color="#ed6c02"
          subtitle="Needs attention"
        />
        <StatCard
          title="Completed Orders"
          value={stats?.completedOrders || 0}
          icon={<TrendingUp sx={{ color: '#2e7d32', fontSize: 32 }} />}
          color="#2e7d32"
          subtitle="Successfully delivered"
        />
        <StatCard
          title="Total Revenue"
          value={`${(stats?.totalRevenue || 0).toFixed(2)} PLN`}
          icon={<AttachMoney sx={{ color: '#9c27b0', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="From completed orders"
        />
        <StatCard
          title="Active Stores"
          value={stats?.activeStores || 0}
          icon={<Store sx={{ color: '#0288d1', fontSize: 32 }} />}
          color="#0288d1"
          subtitle="Currently operating"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          icon={<Inventory sx={{ color: '#d32f2f', fontSize: 32 }} />}
          color="#d32f2f"
          subtitle="Needs restocking"
        />
      </Box>

      {/* Recent Activity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Recent Orders */}
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Orders
            </Typography>
            {ordersLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={30} />
              </Box>
            ) : recentOrders && recentOrders.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order: any) => (
                      <TableRow key={order.orderId} hover>
                        <TableCell>#{order.orderId}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{order.totalAmount.toFixed(2)} PLN</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" align="center" py={3}>
                No recent orders
              </Typography>
            )}
          </Paper>

        {/* Recent Transactions */}
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Transactions
            </Typography>
            {transactionsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={30} />
              </Box>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.map((transaction: any) => (
                      <TableRow key={transaction.transactionId} hover>
                        <TableCell>#{transaction.transactionId}</TableCell>
                        <TableCell>{transaction.storeName}</TableCell>
                        <TableCell>
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip label={transaction.transactionType} size="small" />
                        </TableCell>
                        <TableCell>{transaction.totalAmount.toFixed(2)} PLN</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" align="center" py={3}>
                No recent transactions
              </Typography>
            )}
          </Paper>
      </Box>
    </Container>
  );
};

export default DashboardPage;
