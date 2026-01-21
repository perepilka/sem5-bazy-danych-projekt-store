import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/client';

export interface UpdateOrderStatusRequest {
  status: 'W_REALIZACJI' | 'GOTOWE_DO_ODBIORU' | 'ZAKONCZONE' | 'ANULOWANE';
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: UpdateOrderStatusRequest['status'] }) => {
      // Backend expects status as query parameter, not body
      const response = await axios.patch(`/orders/${orderId}/status?status=${status}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};
