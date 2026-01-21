import axios from '../client';
import type { PageResponse, PageableParams } from '../types';

export interface Employee {
  employeeId: number;
  storeId: number;
  storeName: string;
  firstName: string;
  lastName: string;
  position: string;
  login: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  storeId: number;
  firstName: string;
  lastName: string;
  position: string;
  login: string;
  password: string;
}

export interface UpdateEmployeeRequest {
  storeId?: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  isActive?: boolean;
}

export const employeesApi = {
  getAll: (params?: PageableParams & { storeId?: number; position?: string }) =>
    axios.get<PageResponse<Employee>>('/employees', { params }),

  getById: (id: number) =>
    axios.get<Employee>(`/employees/${id}`),

  create: (data: CreateEmployeeRequest) =>
    axios.post<Employee>('/employees', data),

  update: (id: number, data: UpdateEmployeeRequest) =>
    axios.put<Employee>(`/employees/${id}`, data),

  toggleStatus: (id: number) =>
    axios.patch<Employee>(`/employees/${id}/toggle-status`),

  delete: (id: number) =>
    axios.delete(`/employees/${id}`),
};
