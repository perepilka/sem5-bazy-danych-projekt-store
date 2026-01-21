import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  Store as StoreIcon,
  Phone,
  LocationOn,
  Schedule,
  Inventory,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../hooks/useStores';

const StoresPage = () => {
  const navigate = useNavigate();
  const { data: storesPage, isLoading, error } = useStores({ page: 0, size: 100 });

  const stores = storesPage?.content || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <StoreIcon fontSize="large" color="primary" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Stores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all store locations and information
          </Typography>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error">Failed to load stores. Please try again later.</Alert>
      ) : isLoading ? (
        <Paper elevation={2} sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : stores.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <StoreIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No stores found
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {stores.map((store: any) => (
            <Card key={store.storeId} elevation={2} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5" fontWeight="bold">
                    {store.name}
                  </Typography>
                  <Chip
                    label={store.isActive ? 'Active' : 'Inactive'}
                    color={store.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn color="action" fontSize="small" />
                    <Box>
                      <Typography variant="body2">
                        {store.street}
                      </Typography>
                      <Typography variant="body2">
                        {store.zipCode} {store.city}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone color="action" fontSize="small" />
                    <Typography variant="body2">{store.phoneNumber}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Schedule color="action" fontSize="small" />
                    <Typography variant="body2">
                      {store.openHour?.substring(0, 5)} - {store.closeHour?.substring(0, 5)}
                    </Typography>
                  </Box>
                </Box>

                <Box mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<Inventory />}
                    fullWidth
                    onClick={() => navigate(`/employee/inventory?storeId=${store.storeId}`)}
                  >
                    View Inventory
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default StoresPage;
