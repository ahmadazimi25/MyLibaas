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
  CircularProgress,
  Alert,
} from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../components/Search/SearchBar';
import FilterSidebar from '../components/Search/FilterSidebar';
import { useSearch } from '../contexts/SearchContext';
import ProductService from '../services/ProductService';

const Browse = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFilters, setShowFilters] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  const { filters, searchQuery, buildSearchParams } = useSearch();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchParams = {
          searchQuery,
          filters,
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'desc'
        };

        const result = await ProductService.searchProducts(searchParams);
        setItems(result.products);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters, searchQuery]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const searchParams = {
        searchQuery,
        filters,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        lastDoc
      };

      const result = await ProductService.searchProducts(searchParams);
      setItems(prevItems => [...prevItems, ...result.products]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more items:', error);
      setError('Failed to load more items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            {!loading && !error && (
              <Typography color="text.secondary">
                {items.length} items found
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={item.images[0]}
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.culture}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${item.pricePerDay}/day
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

          {/* Load More Button */}
          {hasMore && !loading && !error && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                size="large"
              >
                Load More
              </Button>
            </Box>
          )}

          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Browse;
