import apiClient from '../client';
import type { LoginRequest, RegisterCustomerRequest, AuthResponse } from '../types';

export const authApi = {
  // Customer login
  customerLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/customer/login', credentials);
    return response.data;
  },

  // Employee login
  employeeLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/employee/login', credentials);
    return response.data;
  },

  // Customer registration
  registerCustomer: async (data: RegisterCustomerRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/customer/register', data);
    return response.data;
  },
};
