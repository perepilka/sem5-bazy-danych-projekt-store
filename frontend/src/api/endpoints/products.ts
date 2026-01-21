import apiClient from '../client';
import type { 
  ProductDTO, 
  CreateProductRequest, 
  ProductAvailabilityDTO,
  PageResponse,
  PageableParams 
} from '../types';

export const productsApi = {
  // Get all products (paginated)
  getProducts: async (params?: PageableParams & { query?: string }): Promise<PageResponse<ProductDTO>> => {
    const response = await apiClient.get<PageResponse<ProductDTO>>('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProduct: async (id: number): Promise<ProductDTO> => {
    const response = await apiClient.get<ProductDTO>(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, params?: PageableParams): Promise<PageResponse<ProductDTO>> => {
    const response = await apiClient.get<PageResponse<ProductDTO>>('/products/search', {
      params: { query, ...params },
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number, params?: PageableParams): Promise<PageResponse<ProductDTO>> => {
    const response = await apiClient.get<PageResponse<ProductDTO>>(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  // Check product availability across stores
  getProductAvailability: async (id: number): Promise<ProductAvailabilityDTO> => {
    const response = await apiClient.get<ProductAvailabilityDTO>(`/products/${id}/availability`);
    return response.data;
  },

  // Create product (KIEROWNIK only)
  createProduct: async (data: CreateProductRequest): Promise<ProductDTO> => {
    const response = await apiClient.post<ProductDTO>('/products', data);
    return response.data;
  },

  // Update product (KIEROWNIK only)
  updateProduct: async (id: number, data: Partial<CreateProductRequest>): Promise<ProductDTO> => {
    const response = await apiClient.put<ProductDTO>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (KIEROWNIK only)
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
