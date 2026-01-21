import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { LayoutWrapper } from '../components/layout/LayoutWrapper';
import { EmployeeLayout } from '../components/layout/EmployeeLayout';
import { ROUTES } from '../utils/constants';

// Lazy load pages
import { lazy } from 'react';

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const EmployeeLoginPage = lazy(() => import('../pages/auth/EmployeeLoginPage'));

// Customer pages
const ProductsPage = lazy(() => import('../pages/customer/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('../pages/customer/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/customer/OrdersPage'));
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'));

// Employee pages
const DashboardPage = lazy(() => import('../pages/employee/DashboardPage'));
const InventoryPage = lazy(() => import('../pages/employee/InventoryPage'));
const DeliveriesPage = lazy(() => import('../pages/employee/DeliveriesPage'));
const EmployeeOrdersPage = lazy(() => import('../pages/employee/EmployeeOrdersPage'));
const TransactionsPage = lazy(() => import('../pages/employee/TransactionsPage'));
const ReturnsPage = lazy(() => import('../pages/employee/ReturnsPage'));
const StoresPage = lazy(() => import('../pages/employee/StoresPage'));
const EmployeesPage = lazy(() => import('../pages/employee/EmployeesPage'));
const ProductsManagementPage = lazy(() => import('../pages/employee/ProductsManagementPage'));
const CategoriesManagementPage = lazy(() => import('../pages/employee/CategoriesManagementPage'));

// Not found page
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.PRODUCTS} replace />,
  },
  
  // Public/Customer routes with LayoutWrapper
  {
    element: <LayoutWrapper />,
    children: [
      {
        path: ROUTES.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: ROUTES.PRODUCT_DETAIL,
        element: <ProductDetailPage />,
      },
      {
        path: ROUTES.CART,
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CHECKOUT,
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ORDERS,
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  
  // Auth routes
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.EMPLOYEE_LOGIN,
    element: <EmployeeLoginPage />,
  },

  // Protected employee routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          {
            element: <RoleBasedRoute requireEmployee />,
            children: [
              {
                path: ROUTES.EMPLOYEE_DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.EMPLOYEE_INVENTORY,
                element: <InventoryPage />,
              },
              {
                path: ROUTES.EMPLOYEE_ORDERS,
                element: <EmployeeOrdersPage />,
              },
              {
                path: ROUTES.EMPLOYEE_TRANSACTIONS,
                element: <TransactionsPage />,
              },
            ],
          },
          
          // Routes for MAGAZYNIER and KIEROWNIK
          {
            element: <RoleBasedRoute requireEmployee allowedRoles={['MAGAZYNIER', 'KIEROWNIK']} />,
            children: [
              {
                path: ROUTES.EMPLOYEE_DELIVERIES,
                element: <DeliveriesPage />,
              },
        ],
      },
          
          // Routes for SPRZEDAWCA and KIEROWNIK
          {
            element: <RoleBasedRoute requireEmployee allowedRoles={['SPRZEDAWCA', 'KIEROWNIK']} />,
            children: [
              {
                path: ROUTES.EMPLOYEE_RETURNS,
                element: <ReturnsPage />,
              },
            ],
          },
          
          // Routes for KIEROWNIK only
          {
            element: <RoleBasedRoute requireEmployee allowedRoles={['KIEROWNIK']} />,
            children: [
              {
                path: ROUTES.EMPLOYEE_STORES,
                element: <StoresPage />,
              },
              {
                path: ROUTES.EMPLOYEE_EMPLOYEES,
                element: <EmployeesPage />,
              },
              {
                path: ROUTES.EMPLOYEE_PRODUCTS,
                element: <ProductsManagementPage />,
              },
              {
                path: ROUTES.EMPLOYEE_CATEGORIES,
                element: <CategoriesManagementPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // 404 page
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
