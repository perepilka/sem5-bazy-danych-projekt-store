import apiClient from '../client';
import type { ReturnDTO, UpdateReturnStatusRequest, PageResponse, PageableParams } from '../types';

export const returnsApi = {
  // Get all returns (Employee)
  getReturns: async (params?: PageableParams): Promise<PageResponse<ReturnDTO>> => {
    const response = await apiClient.get<PageResponse<ReturnDTO>>('/returns', { params });
    return response.data;
  },

  // Get return by ID
  getReturn: async (id: number): Promise<ReturnDTO> => {
    const response = await apiClient.get<ReturnDTO>(`/returns/${id}`);
    return response.data;
  },

  // Update return status (Employee: SPRZEDAWCA, KIEROWNIK)
  updateReturnStatus: async (id: number, data: UpdateReturnStatusRequest): Promise<ReturnDTO> => {
    const response = await apiClient.patch<ReturnDTO>(`/returns/${id}/status`, data);
    return response.data;
  },
};
