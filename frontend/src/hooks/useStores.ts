import { useQuery } from '@tanstack/react-query';
import { storesApi } from '../api/endpoints/stores';
import type { PageableParams } from '../api/types';

export const useStores = (params?: PageableParams) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => storesApi.getStores(params),
  });
};

export const useStore = (id: number) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.getStore(id),
    enabled: !!id,
  });
};

export const useStoresByCity = (city: string, params?: PageableParams) => {
  return useQuery({
    queryKey: ['stores-by-city', city, params],
    queryFn: () => storesApi.getStoresByCity(city, params),
    enabled: !!city,
  });
};
