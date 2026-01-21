import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/endpoints/orders';
import type { CreateOrderRequest, PageableParams } from '../api/types';

export const useMyOrders = (params?: PageableParams) => {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => ordersApi.getMyOrders(params),
  });
};

export const useAllOrders = (params?: PageableParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAllOrders(params),
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  });
};

export const useCheckOrderAvailability = () => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.checkAvailability(data),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};
