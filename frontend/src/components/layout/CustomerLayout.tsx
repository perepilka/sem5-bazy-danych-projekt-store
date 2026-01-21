import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import { ROUTES, APP_NAME } from '../../utils/constants';

export const CustomerLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();
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
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate(ROUTES.HOME)}
            >
              {APP_NAME}
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>


              <Button color="inherit" onClick={() => navigate(ROUTES.PRODUCTS)}>
                Products
              </Button>

              <Button color="inherit" onClick={() => navigate(ROUTES.ORDERS)}>
                My Orders
              </Button>

              <IconButton
                color="inherit"
                onClick={() => navigate(ROUTES.CART)}
                sx={{ mx: 1 }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {user && (
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {user.username}
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
                onClick={() => navigate(ROUTES.CART)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

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

                <MenuItem onClick={() => handleNavigation(ROUTES.PRODUCTS)}>
                  Products
                </MenuItem>
                <MenuItem onClick={() => handleNavigation(ROUTES.ORDERS)}>
                  My Orders
                </MenuItem>
                {user && (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user.username}
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
