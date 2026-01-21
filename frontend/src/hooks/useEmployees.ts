import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '../api/endpoints/employees';
import type { PageableParams } from '../api/types';

export const useEmployees = (params?: PageableParams & { storeId?: number; position?: string }) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const response = await employeesApi.getAll(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await employeesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useToggleEmployeeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => employeesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
