import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Rating,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  SentimentVeryDissatisfied as VeryDissatisfiedIcon,
  SentimentDissatisfied as DissatisfiedIcon,
  SentimentNeutral as NeutralIcon,
  SentimentSatisfied as SatisfiedIcon,
  SentimentVerySatisfied as VerySatisfiedIcon,
} from '@mui/icons-material';

const customIcons = {
  1: {
    icon: <VeryDissatisfiedIcon fontSize="inherit" />,
    label: 'Very Dissatisfied',
  },
  2: {
    icon: <DissatisfiedIcon fontSize="inherit" />,
    label: 'Dissatisfied',
  },
  3: {
    icon: <NeutralIcon fontSize="inherit" />,
    label: 'Neutral',
  },
  4: {
    icon: <SatisfiedIcon fontSize="inherit" />,
    label: 'Satisfied',
  },
  5: {
    icon: <VerySatisfiedIcon fontSize="inherit" />,
    label: 'Very Satisfied',
  },
};

const IconContainer = ({ value, ...props }) => {
  const { icon, label } = customIcons[value];
  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '2rem',
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
};

const ratingQuestions = [
  {
    id: 'fairness',
    question: 'How fair was the resolution?',
    description: 'Rate the overall fairness of the dispute resolution',
  },
  {
    id: 'speed',
    question: 'How satisfied are you with the resolution speed?',
    description: 'Rate how quickly your dispute was resolved',
  },
  {
    id: 'communication',
    question: 'How was the communication during the process?',
    description: 'Rate the clarity and effectiveness of communication',
  },
  {
    id: 'outcome',
    question: 'How satisfied are you with the final outcome?',
    description: 'Rate your satisfaction with the resolution outcome',
  },
];

const ResolutionRating = ({ disputeId, onSubmit, onClose }) => {
  const [ratings, setRatings] = useState({
    fairness: 0,
    speed: 0,
    communication: 0,
    outcome: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRatingChange = (questionId, value) => {
    setRatings((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = {
        disputeId,
        ratings,
        feedback,
        timestamp: new Date(),
      };

      onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Object.values(ratings).every((r) => r > 0);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rate the Resolution</DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {ratingQuestions.map(({ id, question, description }) => (
            <Box key={id}>
              <Typography variant="subtitle1" gutterBottom>
                {question}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                {description}
              </Typography>
              <Rating
                name={id}
                value={ratings[id]}
                onChange={(event, value) => handleRatingChange(id, value)}
                IconContainerComponent={IconContainer}
                sx={{
                  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
                    color: 'action.disabled',
                  },
                }}
              />
            </Box>
          ))}

          <TextField
            label="Additional Feedback"
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            fullWidth
            placeholder="Please share any additional feedback about your experience..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isComplete || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResolutionRating;
