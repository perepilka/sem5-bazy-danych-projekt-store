import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../utils/constants';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShoppingBagIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Wide Selection',
      description: 'Browse thousands of products across multiple categories',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Store Pickup',
      description: 'Pick up your order at your nearest store location',
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Secure Shopping',
      description: 'Shop with confidence - your data is protected',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}
          >
            Welcome to {APP_NAME}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ mb: 4, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
          >
            Your one-stop shop for quality products
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate(ROUTES.PRODUCTS)}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Shopping
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ mb: 6 }}
        >
          Why Shop With Us
        </Typography>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 4
          }}
        >
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-8px)' }
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h4">
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse our catalog and find exactly what you need
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.PRODUCTS)}
              sx={{ px: 4, py: 1.5 }}
            >
              Browse Products
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
