import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/client';
import type { PageableParams } from '../api/types';

export interface DeliveryLineDTO {
  deliveryLineId: number;
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalPrice: number;
  storeId?: number;
  storeName?: string;
}

export interface DeliveryDTO {
  deliveryId: number;
  supplierName: string;
  deliveryDate: string;
  status: 'PRZYJETA' | 'OCZEKUJACA' | 'W_TRAKCIE' | 'ZREALIZOWANA' | 'ANULOWANA';
  lines: DeliveryLineDTO[];
}

export interface CreateDeliveryRequest {
  supplierName: string;
  deliveryDate: string;
  lines: {
    productId: number;
    quantity: number;
    purchasePrice: number;
    storeId: number;
  }[];
}

export interface UpdateDeliveryStatusRequest {
  status: 'W_TRAKCIE' | 'ZREALIZOWANA' | 'ANULOWANA' | string;
}

export const useDeliveries = (params?: PageableParams & { status?: string }) => {
  return useQuery({
    queryKey: ['deliveries', params],
    queryFn: async () => {
      const response = await axios.get('/deliveries', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDelivery = (id: number | null) => {
  return useQuery({
    queryKey: ['delivery', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/deliveries/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDeliveryRequest) => {
      const response = await axios.post('/deliveries', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: UpdateDeliveryStatusRequest['status'] }) => {
      const response = await axios.patch(`/deliveries/${id}/status?status=${status}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', variables.id] });
    },
  });
};
