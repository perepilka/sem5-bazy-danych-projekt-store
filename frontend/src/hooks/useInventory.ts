import { useQuery } from '@tanstack/react-query';
import axios from '../api/client';

export interface StoreInventoryItem {
  productId: number;
  productName: string;
  categoryName: string;
  availableCount: number;
  onDisplayCount: number;
  reservedCount: number;
  totalCount: number;
}

export const useStoreInventory = (storeId: number | null) => {
  return useQuery<StoreInventoryItem[]>({
    queryKey: ['inventory', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const response = await axios.get(`/stores/${storeId}/inventory`);
      return response.data;
    },
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
