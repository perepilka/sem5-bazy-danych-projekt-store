import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterCustomerRequest } from '../api/types';
import { ROUTES } from '../utils/constants';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, isCustomer, isEmployee, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // Customer login mutation
  const customerLoginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.customerLogin(credentials),
    onSuccess: (data) => {
      login(data);
      navigate(ROUTES.PRODUCTS);
    },
  });

  // Employee login mutation
  const employeeLoginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.employeeLogin(credentials),
    onSuccess: (data) => {
      login(data);
      navigate(ROUTES.EMPLOYEE_DASHBOARD);
    },
  });

  // Customer registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterCustomerRequest) => authApi.registerCustomer(data),
    onSuccess: (data) => {
      login(data);
      navigate(ROUTES.PRODUCTS);
    },
  });

  // Logout function
  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return {
    user,
    isAuthenticated,
    isCustomer: isCustomer(),
    isEmployee: isEmployee(),
    hasRole,
    
    // Mutations
    customerLogin: customerLoginMutation.mutate,
    employeeLogin: employeeLoginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    
    // Loading states
    isLoggingIn: customerLoginMutation.isPending || employeeLoginMutation.isPending,
    isRegistering: registerMutation.isPending,
    
    // Errors
    loginError: customerLoginMutation.error || employeeLoginMutation.error,
    registerError: registerMutation.error,
  };
};
