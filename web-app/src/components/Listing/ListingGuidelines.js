import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CrossIcon,
  PhotoCamera as CameraIcon,
  LocalLaundryService as LaundryIcon,
  Iron as IronIcon,
  LightbulbOutlined as TipIcon,
} from '@mui/icons-material';

const ListingGuidelines = () => {
  const photoRequirements = [
    {
      title: 'Clean Background',
      correct: 'Plain white or light-colored wall background',
      incorrect: 'Cluttered or distracting backgrounds',
    },
    {
      title: 'Lighting',
      correct: 'Well-lit, natural lighting or professional lighting setup',
      incorrect: 'Dark, shadowy, or harsh lighting',
    },
    {
      title: 'Multiple Angles',
      correct: 'Front, back, side views, and close-ups of details',
      incorrect: 'Single angle or missing important details',
    },
    {
      title: 'Presentation',
      correct: 'Properly steamed/ironed, on a hanger or mannequin',
      incorrect: 'Wrinkled, lying on floor/bed, or poorly displayed',
    },
  ];

  const garmentRequirements = [
    {
      title: 'Cleaning',
      description: 'All items must be professionally dry cleaned or washed according to care instructions',
      icon: <LaundryIcon />,
    },
    {
      title: 'Pressing',
      description: 'Items must be properly pressed or steamed to remove all wrinkles',
      icon: <IronIcon />,
    },
    {
      title: 'Photography',
      description: 'High-quality photos in good lighting with white background',
      icon: <CameraIcon />,
    },
  ];

  const qualityTips = [
    'Use a tripod for steady, clear photos',
    'Take photos during daylight hours for best natural lighting',
    'Steam or iron the garment immediately before photographing',
    'Include close-ups of any special details, embellishments, or brand labels',
    'Show the true color of the garment (avoid filters)',
    'Include size tag in one of the photos',
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Listing Guidelines
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Higher quality listings receive better visibility and are more likely to be rented.
        Follow these guidelines to maximize your success!
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photo Requirements
            </Typography>
            <List>
              {photoRequirements.map((req, index) => (
                <React.Fragment key={req.title}>
                  <ListItem>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {req.title}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                            <CheckIcon sx={{ mr: 1 }} />
                            <Typography variant="body2">{req.correct}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                            <CrossIcon sx={{ mr: 1 }} />
                            <Typography variant="body2">{req.incorrect}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < photoRequirements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Garment Requirements
            </Typography>
            <List>
              {garmentRequirements.map((req, index) => (
                <React.Fragment key={req.title}>
                  <ListItem>
                    <ListItemIcon>{req.icon}</ListItemIcon>
                    <ListItemText 
                      primary={req.title}
                      secondary={req.description}
                    />
                  </ListItem>
                  {index < garmentRequirements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TipIcon sx={{ mr: 1 }} />
              Pro Tips for Better Photos
            </Typography>
            <List>
              {qualityTips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Card>
            <CardMedia
              component="img"
              height="200"
              image="/path/to/example-photo.jpg"
              alt="Example of good listing photo"
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Example of a Perfect Listing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notice the clean white background, proper lighting, multiple angles,
                and well-pressed garment. This type of presentation significantly
                increases your chances of successful rentals.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListingGuidelines;
