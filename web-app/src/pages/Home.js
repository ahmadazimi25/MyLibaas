import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import Image from '../components/Image';
import Logo from '../components/Logo';
import { getCultureById } from '../data/culturalClothing';

const Home = () => {
  const navigate = useNavigate();

  // Select 4 featured items from our products
  const featuredItems = products.slice(0, 4);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container maxWidth="md" sx={{ pt: 8, pb: 6, textAlign: 'center' }}>
        {/* Logo */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Logo size="large" />
        </Box>

        <Typography
          variant="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 3,
          }}
        >
          Rent. Earn.
          <br />
          Share your closet.
        </Typography>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 6 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/browse')}
          >
            Browse Listings
          </Button>
        </Stack>

        {/* Search Bar */}
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 8 }}>
          <TextField
            fullWidth
            placeholder="Search items..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>

        {/* Featured Items */}
        <Typography variant="h2" gutterBottom sx={{ mb: 4, fontSize: '2rem' }}>
          Featured Items
        </Typography>
        <Grid container spacing={3}>
          {featuredItems.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  height={280}
                  borderRadius="8px 8px 0 0"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="primary.main" sx={{ fontWeight: 600 }}>
                    ${item.pricePerDay}/day
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCultureById(item.culture)?.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
