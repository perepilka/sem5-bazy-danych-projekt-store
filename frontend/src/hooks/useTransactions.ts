import { useQuery } from '@tanstack/react-query';
import axios from '../api/client';
import type { PageableParams } from '../api/types';

export interface TransactionItemDTO {
  transactionItemId: number;
  itemId: number;
  productId: number;
  productName: string;
  price: number;
}

export interface TransactionDTO {
  transactionId: number;
  storeId: number;
  storeName: string;
  employeeId?: number;
  employeeName?: string;
  customerId?: number;
  customerName?: string;
  transactionDate: string;
  totalAmount: number;
  transactionType: string;
  items: TransactionItemDTO[];
}

export const useTransactions = (params?: PageableParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const response = await axios.get('/transactions', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTransaction = (id: number | null) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
