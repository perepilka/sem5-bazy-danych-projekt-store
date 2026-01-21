import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/endpoints/products';
import { categoriesApi } from '../api/endpoints/categories';
import type { PageableParams } from '../api/types';

export const useProducts = (params?: PageableParams & { query?: string; categoryId?: number }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      if (params?.query) {
        return productsApi.searchProducts(params.query, params);
      }
      if (params?.categoryId) {
        return productsApi.getProductsByCategory(params.categoryId, params);
      }
      return productsApi.getProducts(params);
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
};

export const useProductAvailability = (id: number) => {
  return useQuery({
    queryKey: ['product-availability', id],
    queryFn: () => productsApi.getProductAvailability(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });
};
