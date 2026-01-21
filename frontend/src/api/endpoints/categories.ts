import apiClient from '../client';
import type { CategoryDTO } from '../types';

export interface CreateCategoryRequest {
  name: string;
}

export const categoriesApi = {
  // Get all categories (returns array, not paginated)
  getCategories: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>('/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: number): Promise<CategoryDTO> => {
    const response = await apiClient.get<CategoryDTO>(`/categories/${id}`);
    return response.data;
  },

  // Create category (KIEROWNIK only)
  createCategory: async (data: CreateCategoryRequest): Promise<CategoryDTO> => {
    const response = await apiClient.post<CategoryDTO>('/categories', data);
    return response.data;
  },

  // Update category (KIEROWNIK only)
  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<CategoryDTO> => {
    const response = await apiClient.put<CategoryDTO>(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category (KIEROWNIK only)
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
