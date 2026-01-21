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
  Grid,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../../utils/validators';
import { ROUTES, APP_NAME } from '../../utils/constants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <Container maxWidth="md">
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
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{ mr: 'auto' }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom align="center">
              {APP_NAME}
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              Create Account
            </Typography>

            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(registerError as any)?.response?.data?.message || 'Registration failed'}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...register('firstName')}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={isRegistering}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...register('lastName')}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={isRegistering}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('email')}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isRegistering}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('phoneNumber')}
                    label="Phone Number"
                    fullWidth
                    placeholder="+48 XXX XXX XXX"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    disabled={isRegistering}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('password')}
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isRegistering}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register('confirmPassword')}
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={isRegistering}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={isRegistering}
              >
                {isRegistering ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to={ROUTES.LOGIN} style={{ textDecoration: 'none' }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPage;
