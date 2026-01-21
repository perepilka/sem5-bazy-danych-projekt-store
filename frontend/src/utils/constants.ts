export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Store Management System';

// Order statuses
export const ORDER_STATUS = {
  ZATWIERDZONY: 'Approved',
  ANULOWANY: 'Cancelled',
  GOTOWY_DO_ODBIORU: 'Ready for Pickup',
  ODEBRANY: 'Picked Up',
} as const;

// Delivery statuses
export const DELIVERY_STATUS = {
  W_TRAKCIE: 'In Progress',
  ZREALIZOWANA: 'Completed',
  ANULOWANA: 'Cancelled',
} as const;

// Return statuses
export const RETURN_STATUS = {
  ROZPATRYWANY: 'Under Review',
  PRZYJETY: 'Accepted',
  ODRZUCONY: 'Rejected',
} as const;

// User roles
export const USER_ROLES = {
  KIEROWNIK: 'Manager',
  SPRZEDAWCA: 'Salesperson',
  MAGAZYNIER: 'Warehouse Worker',
} as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EMPLOYEE_LOGIN: '/employee/login',
  
  // Customer routes
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  
  // Employee routes
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_INVENTORY: '/employee/inventory',
  EMPLOYEE_DELIVERIES: '/employee/deliveries',
  EMPLOYEE_ORDERS: '/employee/orders',
  EMPLOYEE_TRANSACTIONS: '/employee/transactions',
  EMPLOYEE_RETURNS: '/employee/returns',
  EMPLOYEE_STORES: '/employee/stores',
  EMPLOYEE_EMPLOYEES: '/employee/employees',
  EMPLOYEE_PRODUCTS: '/employee/products',
  EMPLOYEE_CATEGORIES: '/employee/categories',
} as const;
