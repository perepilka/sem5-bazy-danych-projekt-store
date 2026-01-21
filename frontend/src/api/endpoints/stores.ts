import apiClient from '../client';
import type { StoreDTO, StoreInventoryDTO, LowStockItemDTO, PageResponse, PageableParams, DeliveryDTO } from '../types';

export const storesApi = {
  // Get all stores (paginated)
  getStores: async (params?: PageableParams): Promise<PageResponse<StoreDTO>> => {
    const response = await apiClient.get<PageResponse<StoreDTO>>('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStore: async (id: number): Promise<StoreDTO> => {
    const response = await apiClient.get<StoreDTO>(`/stores/${id}`);
    return response.data;
  },

  // Search stores
  searchStores: async (query: string, params?: PageableParams): Promise<PageResponse<StoreDTO>> => {
    const response = await apiClient.get<PageResponse<StoreDTO>>('/stores/search', {
      params: { query, ...params },
    });
    return response.data;
  },

  // Get stores by city
  getStoresByCity: async (city: string, params?: PageableParams): Promise<PageResponse<StoreDTO>> => {
    const response = await apiClient.get<PageResponse<StoreDTO>>(`/stores/city/${city}`, { params });
    return response.data;
  },

  // Get store inventory (Employee)
  getStoreInventory: async (id: number): Promise<StoreInventoryDTO[]> => {
    const response = await apiClient.get<StoreInventoryDTO[]>(`/stores/${id}/inventory`);
    return response.data;
  },

  // Get low stock items
  getLowStockItems: async (id: number): Promise<LowStockItemDTO[]> => {
    const response = await apiClient.get<LowStockItemDTO[]>(`/stores/${id}/low-stock`);
    return response.data;
  },

  // Create auto-delivery for low stock items
  createAutoDelivery: async (id: number): Promise<DeliveryDTO> => {
    const response = await apiClient.post<DeliveryDTO>(`/stores/${id}/auto-delivery`);
    return response.data;
  },
};
