import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../components/Search/SearchBar';
import FilterSidebar from '../components/Search/FilterSidebar';
import { useSearch } from '../contexts/SearchContext';

const Browse = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFilters, setShowFilters] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  const { filters, searchQuery, buildSearchParams } = useSearch();

  // TODO: Replace with actual API call
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchItems = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const params = buildSearchParams();
        console.log('Fetching items with params:', params);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockItems = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          title: `Sample Item ${i + 1}`,
          description: 'A beautiful piece of clothing for rent',
          price: Math.floor(Math.random() * 200) + 50,
          image: `https://picsum.photos/400/600?random=${i}`,
          location: 'Toronto, ON',
          rating: 4.5,
          reviews: 12,
        }));
        
        setItems(mockItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters, searchQuery, buildSearchParams]);

  const handleFilterApply = () => {
    const params = buildSearchParams();
    navigate(`/browse?${params}`);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <SearchBar />
      </Box>

      <Grid container spacing={3}>
        {isMobile && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <IconButton
              onClick={() => setShowFilters(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                width: 56,
                height: 56,
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Box>
        )}

        {/* Filters */}
        {(showFilters || !isMobile) && (
          <Grid item xs={12} md={3}>
            <FilterSidebar
              open={showFilters}
              onClose={() => setShowFilters(false)}
              onApply={handleFilterApply}
            />
          </Grid>
        )}

        {/* Results */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Search Results
            </Typography>
            {!loading && (
              <Typography color="text.secondary">
                {items.length} items found
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={item.image}
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.location}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${item.price}/day
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/items/${item.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Browse;
