import apiClient from '../client';
import type {
  OrderDTO,
  CreateOrderRequest,
  OrderAvailabilityDTO,
  PageResponse,
  PageableParams,
} from '../types';

export const ordersApi = {
  // Check order availability before placing
  checkAvailability: async (data: CreateOrderRequest): Promise<OrderAvailabilityDTO> => {
    const response = await apiClient.post<OrderAvailabilityDTO>('/orders/check-availability', data);
    return response.data;
  },

  // Create order (Customer)
  createOrder: async (data: CreateOrderRequest): Promise<OrderDTO> => {
    const response = await apiClient.post<OrderDTO>('/orders', data);
    return response.data;
  },

  // Get my orders (Customer)
  getMyOrders: async (params?: PageableParams): Promise<PageResponse<OrderDTO>> => {
    const response = await apiClient.get<PageResponse<OrderDTO>>('/orders/my', { params });
    return response.data;
  },

  // Get all orders (Employee)
  getAllOrders: async (params?: PageableParams): Promise<PageResponse<OrderDTO>> => {
    const response = await apiClient.get<PageResponse<OrderDTO>>('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: number): Promise<OrderDTO> => {
    const response = await apiClient.get<OrderDTO>(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Employee: SPRZEDAWCA, KIEROWNIK)
  updateOrderStatus: async (id: number, status: string): Promise<OrderDTO> => {
    const response = await apiClient.patch<OrderDTO>(`/orders/${id}/status?status=${status}`);
    return response.data;
  },
};
