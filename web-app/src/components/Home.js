import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { 
  LocalOffer as LocalOfferIcon,
  Security as SecurityIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import SearchBar from './SearchBar';
import FilterDrawer from './FilterDrawer';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);

  const features = [
    {
      icon: <LocalOfferIcon sx={{ fontSize: 40 }} />,
      title: 'Best Prices',
      description: 'Rent designer clothing at a fraction of retail prices'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Rentals',
      description: 'Verified users and secure payment processing'
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Items',
      description: 'Curated selection of high-quality clothing'
    }
  ];

  const categories = [
    {
      title: 'Formal Wear',
      image: '/images/formal.jpg',
      path: '/browse?category=formal'
    },
    {
      title: 'Traditional',
      image: '/images/traditional.jpg',
      path: '/browse?category=traditional'
    },
    {
      title: 'Designer',
      image: '/images/designer.jpg',
      path: '/browse?category=designer'
    },
    {
      title: 'Modest Fashion',
      image: '/images/modest.jpg',
      path: '/browse?category=modest'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/images/hero.jpg)',
          height: isMobile ? '60vh' : '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, md: 6 },
              pr: { md: 0 },
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 2
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Rent Designer Clothing
            </Typography>
            <Typography
              variant="h5"
              color="inherit"
              paragraph
              sx={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                mb: 4
              }}
            >
              Access a world of fashion without the commitment. Rent, wear, return.
            </Typography>
            
            {/* Search Bar */}
            <Box sx={{ maxWidth: 600, mb: 4 }}>
              <SearchBar onFilterClick={() => setFilterOpen(true)} />
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    color: 'white',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Browse by Category
          </Typography>
          <Grid container spacing={4}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => navigate(category.path)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" align="center">
                      {category.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom>
            Have items to rent?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Turn your closet into a source of income. List your items now and start earning.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/create-listing')}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Start Listing
          </Button>
        </Container>
      </Box>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </Box>
  );
};

export default Home;
