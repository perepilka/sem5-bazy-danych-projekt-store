import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/client';
import type { PageableParams } from '../api/types';

export interface ReturnItemDTO {
  returnItemId: number;
  itemId: number;
  productId: number;
  productName: string;
  conditionCheck: string;
}

export interface ReturnDTO {
  returnId: number;
  transactionId: number;
  returnDate: string;
  reason: string;
  status: 'ROZPATRYWANY' | 'PRZYJETY' | 'ODRZUCONY';
  items: ReturnItemDTO[];
}

export interface UpdateReturnStatusRequest {
  status: 'ROZPATRYWANY' | 'PRZYJETY' | 'ODRZUCONY';
}

export const useReturns = (params?: PageableParams) => {
  return useQuery({
    queryKey: ['returns', params],
    queryFn: async () => {
      const response = await axios.get('/returns', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReturn = (id: number | null) => {
  return useQuery({
    queryKey: ['return', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/returns/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: UpdateReturnStatusRequest['status'] }) => {
      const response = await axios.patch(`/returns/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['return', variables.id] });
    },
  });
};
