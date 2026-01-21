import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';

export const EmployeeLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (route: string) => {
    navigate(route);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                cursor: 'pointer',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
              onClick={() => navigate(ROUTES.EMPLOYEE_DASHBOARD)}
            >
              {APP_NAME} - Employee
            </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_DASHBOARD)}>
              Dashboard
            </Button>

            <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_ORDERS)}>
              Orders
            </Button>

            <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_INVENTORY)}>
              Inventory
            </Button>

            <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_TRANSACTIONS)}>
              Transactions
            </Button>

            {user?.role && ['MAGAZYNIER', 'KIEROWNIK'].includes(user.role) && (
              <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_DELIVERIES)}>
                Deliveries
              </Button>
            )}

            {user?.role && ['SPRZEDAWCA', 'KIEROWNIK'].includes(user.role) && (
              <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_RETURNS)}>
                Returns
              </Button>
            )}

            {user?.role === 'KIEROWNIK' && (
              <>
                <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_PRODUCTS)}>
                  Products
                </Button>
                <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_CATEGORIES)}>
                  Categories
                </Button>
                <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_STORES)}>
                  Stores
                </Button>
                <Button color="inherit" onClick={() => navigate(ROUTES.EMPLOYEE_EMPLOYEES)}>
                  Employees
                </Button>
              </>
            )}

            {user && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.username} ({user.role})
              </Typography>
            )}

            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Box>

          {/* Mobile Navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_DASHBOARD)}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_ORDERS)}>
                Orders
              </MenuItem>
              <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_INVENTORY)}>
                Inventory
              </MenuItem>
              <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_TRANSACTIONS)}>
                Transactions
              </MenuItem>
              {user?.role && ['MAGAZYNIER', 'KIEROWNIK'].includes(user.role) && (
                <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_DELIVERIES)}>
                  Deliveries
                </MenuItem>
              )}
              {user?.role && ['SPRZEDAWCA', 'KIEROWNIK'].includes(user.role) && (
                <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_RETURNS)}>
                  Returns
                </MenuItem>
              )}
              {user?.role === 'KIEROWNIK' && (
                <>
                  <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_PRODUCTS)}>
                    Products
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_CATEGORIES)}>
                    Categories
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_STORES)}>
                    Stores
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation(ROUTES.EMPLOYEE_EMPLOYEES)}>
                    Employees
                  </MenuItem>
                </>
              )}
              {user && (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user.username} ({user.role})
                  </Typography>
                </MenuItem>
              )}
              <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
