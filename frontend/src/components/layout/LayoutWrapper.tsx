import { useAuthStore } from '../../store/authStore';
import { PublicLayout } from './PublicLayout';
import { CustomerLayout } from './CustomerLayout';

export const LayoutWrapper = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user?.userType === 'CUSTOMER') {
    return <CustomerLayout />;
  }
  
  return <PublicLayout />;
};
