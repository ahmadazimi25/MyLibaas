import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from '@mui/material';
import { useListing } from '../../contexts/ListingContext';

// Steps
import BasicInfo from './steps/BasicInfo';
import SizeInfo from './steps/SizeInfo';
import PricingInfo from './steps/PricingInfo';
import ImageUpload from './steps/ImageUpload';
import Availability from './steps/Availability';

const steps = [
  'Basic Information',
  'Size & Measurements',
  'Pricing',
  'Photos',
  'Availability',
];

const CreateListing = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    validateStep,
    submitListing,
    loading,
  } = useListing();

  const handleNext = useCallback(async () => {
    const isValid = validateStep(currentStep);
    if (!isValid) return;

    if (currentStep === steps.length - 1) {
      const result = await submitListing();
      if (result.success) {
        navigate(`/items/${result.listingId}`);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep, submitListing, navigate, setCurrentStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, [setCurrentStep]);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BasicInfo />;
      case 1:
        return <SizeInfo />;
      case 2:
        return <PricingInfo />;
      case 3:
        return <ImageUpload />;
      case 4:
        return <Availability />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create a New Listing
        </Typography>

        <Stepper activeStep={currentStep} sx={{ py: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {getStepContent(currentStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              disabled={currentStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateListing;
