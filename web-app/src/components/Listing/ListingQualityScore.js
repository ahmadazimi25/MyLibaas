import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const ListingQualityScore = ({ listing }) => {
  // Calculate scores based on listing attributes
  const calculateScores = () => {
    const scores = {
      photos: 0,
      description: 0,
      condition: 0,
      maintenance: 0
    };

    // Photo quality score (max 25 points)
    if (listing.photos) {
      // Points for number of photos (up to 10 points)
      scores.photos += Math.min(listing.photos.length * 2, 10);
      
      // Points for photo quality (up to 15 points)
      if (listing.photoQualityChecks) {
        if (listing.photoQualityChecks.hasWhiteBackground) scores.photos += 4;
        if (listing.photoQualityChecks.hasGoodLighting) scores.photos += 4;
        if (listing.photoQualityChecks.hasMultipleAngles) scores.photos += 4;
        if (listing.photoQualityChecks.isWellPressed) scores.photos += 3;
      }
    }

    // Description quality score (max 25 points)
    if (listing.description) {
      const words = listing.description.split(' ').length;
      scores.description += Math.min(words / 10, 10); // Points for length
      if (listing.descriptionChecks) {
        if (listing.descriptionChecks.hasSizeInfo) scores.description += 5;
        if (listing.descriptionChecks.hasMaterialInfo) scores.description += 5;
        if (listing.descriptionChecks.hasCareInstructions) scores.description += 5;
      }
    }

    // Condition score (max 25 points)
    if (listing.condition) {
      switch (listing.condition) {
        case 'new':
          scores.condition = 25;
          break;
        case 'like_new':
          scores.condition = 20;
          break;
        case 'excellent':
          scores.condition = 15;
          break;
        case 'good':
          scores.condition = 10;
          break;
        default:
          scores.condition = 5;
      }
    }

    // Maintenance score (max 25 points)
    if (listing.maintenance) {
      if (listing.maintenance.isDryCleaned) scores.maintenance += 10;
      if (listing.maintenance.isPressed) scores.maintenance += 10;
      if (listing.maintenance.hasRecentCleaning) scores.maintenance += 5;
    }

    return scores;
  };

  const scores = calculateScores();
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'success.main';
    if (score >= 70) return 'info.main';
    if (score >= 50) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const improvements = [];
  
  // Add improvement suggestions based on scores
  if (scores.photos < 20) {
    improvements.push('Add more high-quality photos with white background and multiple angles');
  }
  if (scores.description < 20) {
    improvements.push('Enhance description with size details, material information, and care instructions');
  }
  if (scores.condition < 15) {
    improvements.push('Consider having the item professionally cleaned or repaired');
  }
  if (scores.maintenance < 20) {
    improvements.push('Ensure item is freshly cleaned and pressed before listing');
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Listing Quality Score
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StarIcon sx={{ color: getScoreColor(totalScore), mr: 1 }} />
          <Typography variant="h4" sx={{ color: getScoreColor(totalScore) }}>
            {totalScore}%
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            ({getScoreLabel(totalScore)})
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={totalScore} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(totalScore),
            }
          }} 
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Score Breakdown
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {Object.entries(scores).map(([category, score]) => (
            <Tooltip key={category} title={`${category.charAt(0).toUpperCase() + category.slice(1)}: ${score}%`}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={score * 4} // Multiply by 4 since each category is out of 25
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(score * 4),
                    }
                  }} 
                />
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {improvements.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Suggested Improvements
          </Typography>
          <List dense>
            {improvements.map((improvement, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {totalScore >= 70 ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText primary={improvement} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default ListingQualityScore;
