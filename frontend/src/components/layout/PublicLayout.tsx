import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
} from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../utils/constants';

export const PublicLayout = () => {
  const navigate = useNavigate();

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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate(ROUTES.PRODUCTS)}>
                Products
              </Button>

              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Login
              </Button>
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
