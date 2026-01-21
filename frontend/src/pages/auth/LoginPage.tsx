import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../../utils/validators';
import { ROUTES, APP_NAME } from '../../utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { customerLogin, isLoggingIn, loginError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    customerLogin(data);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton 
                onClick={() => navigate(ROUTES.HOME)}
                sx={{ mr: 'auto' }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom align="center">
              {APP_NAME}
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              Customer Login
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(loginError as any)?.response?.data?.message || 'Invalid username or password'}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                margin="normal"
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoggingIn}
              />

              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoggingIn}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER} style={{ textDecoration: 'none' }}>
                  Register here
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link to={ROUTES.EMPLOYEE_LOGIN} style={{ textDecoration: 'none' }}>
                  Employee Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
