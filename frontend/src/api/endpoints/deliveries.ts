import apiClient from '../client';
import type {
  DeliveryDTO,
  CreateDeliveryRequest,
  UpdateDeliveryStatusRequest,
  PageResponse,
  PageableParams,
} from '../types';

export const deliveriesApi = {
  // Get all deliveries (Employee: MAGAZYNIER, KIEROWNIK)
  getDeliveries: async (params?: PageableParams): Promise<PageResponse<DeliveryDTO>> => {
    const response = await apiClient.get<PageResponse<DeliveryDTO>>('/deliveries', { params });
    return response.data;
  },

  // Get delivery by ID
  getDelivery: async (id: number): Promise<DeliveryDTO> => {
    const response = await apiClient.get<DeliveryDTO>(`/deliveries/${id}`);
    return response.data;
  },

  // Get restock suggestions
  getRestockSuggestions: async (): Promise<import('../types').RestockSuggestionDTO[]> => {
    const response = await apiClient.get<import('../types').RestockSuggestionDTO[]>('/deliveries/suggestions');
    return response.data;
  },

  // Create delivery (Employee: MAGAZYNIER, KIEROWNIK)
  createDelivery: async (data: CreateDeliveryRequest): Promise<DeliveryDTO> => {
    const response = await apiClient.post<DeliveryDTO>('/deliveries', data);
    return response.data;
  },

  // Update delivery status (Employee: MAGAZYNIER, KIEROWNIK)
  updateDeliveryStatus: async (id: number, data: UpdateDeliveryStatusRequest): Promise<DeliveryDTO> => {
    const response = await apiClient.patch<DeliveryDTO>(`/deliveries/${id}/status`, data);
    return response.data;
  },
};
