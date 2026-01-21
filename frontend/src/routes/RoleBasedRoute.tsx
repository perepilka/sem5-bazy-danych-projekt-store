import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../utils/constants';

interface RoleBasedRouteProps {
  allowedRoles?: string[];
  requireEmployee?: boolean;
  requireCustomer?: boolean;
}

export const RoleBasedRoute = ({ 
  allowedRoles, 
  requireEmployee, 
  requireCustomer 
}: RoleBasedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user must be employee
  if (requireEmployee && user.userType !== 'EMPLOYEE') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Check if user must be customer
  if (requireCustomer && user.userType !== 'CUSTOMER') {
    return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
    }
  }

  return <Outlet />;
};
