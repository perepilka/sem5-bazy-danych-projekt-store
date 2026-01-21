import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  activeStores: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Since there's no dedicated dashboard endpoint, we'll aggregate data from multiple sources
      const [ordersResponse, storesResponse] = await Promise.all([
        apiClient.get('/orders', { params: { page: 0, size: 100 } }),
        apiClient.get('/stores'),
      ]);

      const orders = ordersResponse.data.content || [];
      const stores = storesResponse.data || []; // Stores returns array, not paginated

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o: any) => o.status === 'NOWE' || o.status === 'W_REALIZACJI'
      ).length;
      const completedOrders = orders.filter(
        (o: any) => o.status === 'ZREALIZOWANY'
      ).length;
      const totalRevenue = orders
        .filter((o: any) => o.status === 'ZREALIZOWANY')
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const activeStores = stores.length; // Count all stores as active

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        lowStockProducts: 0, // Will need inventory endpoint for this
        activeStores,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentOrders = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders', limit],
    queryFn: async () => {
      const response = await apiClient.get('/orders', {
        params: { page: 0, size: limit, sort: 'orderDate,desc' },
      });
      return response.data.content || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRecentTransactions = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recentTransactions', limit],
    queryFn: async () => {
      const response = await apiClient.get('/transactions', {
        params: { page: 0, size: limit },
      });
      return response.data.content || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
