import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const NotFoundPage = () => {
  return (
    <Container>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Button component={Link} to={ROUTES.HOME} variant="contained">
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
