import apiClient from '../client';
import type { TransactionDTO, PageResponse, PageableParams } from '../types';

export const transactionsApi = {
  // Get all transactions (Employee)
  getTransactions: async (params?: PageableParams): Promise<PageResponse<TransactionDTO>> => {
    const response = await apiClient.get<PageResponse<TransactionDTO>>('/transactions', { params });
    return response.data;
  },

  // Get transaction by ID
  getTransaction: async (id: number): Promise<TransactionDTO> => {
    const response = await apiClient.get<TransactionDTO>(`/transactions/${id}`);
    return response.data;
  },
};
