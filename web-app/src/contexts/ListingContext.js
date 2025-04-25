import React, { createContext, useContext, useState, useCallback } from 'react';

const ListingContext = createContext(null);

export const useListing = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListing must be used within a ListingProvider');
  }
  return context;
};

export const ListingProvider = ({ children }) => {
  const [listingData, setListingData] = useState({
    // Basic Information
    title: '',
    description: '',
    category: '',
    occasion: [],
    style: [],
    season: '',
    brand: '',

    // Size & Measurements
    size: {
      category: '',
      standard: '',
      measurements: {
        bust: '',
        waist: '',
        hips: '',
        length: '',
        inseam: '',
      },
    },

    // Pricing
    pricing: {
      dailyRate: '',
      weeklyRate: '',
      eventRate: '',
      securityDeposit: '',
      cleaningFee: '',
    },

    // Shipping & Location
    shipping: {
      localPickup: false,
      shipping: false,
      shippingFee: '',
      availableProvinces: [],
    },

    // Condition
    condition: {
      rating: '',
      altered: false,
      alterationDetails: '',
      lastCleaned: null,
      flaws: [],
    },

    // Images
    images: [],

    // Availability
    availability: [],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateListingData = useCallback((updates) => {
    setListingData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const handleImageUpload = useCallback(async (files) => {
    setLoading(true);
    try {
      // TODO: Replace with actual image upload API
      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          // Simulate upload delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          return {
            url: URL.createObjectURL(file),
            alt: file.name,
            isPrimary: false,
          };
        })
      );

      setListingData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeImage = useCallback((index) => {
    setListingData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const setPrimaryImage = useCallback((index) => {
    setListingData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  }, []);

  const updateAvailability = useCallback((dates) => {
    setListingData((prev) => ({
      ...prev,
      availability: dates,
    }));
  }, []);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!listingData.title) newErrors.title = 'Title is required';
        if (!listingData.description) newErrors.description = 'Description is required';
        if (!listingData.category) newErrors.category = 'Category is required';
        break;

      case 1: // Size & Measurements
        if (!listingData.size.category) newErrors.sizeCategory = 'Size category is required';
        if (!listingData.size.standard) newErrors.sizeStandard = 'Standard size is required';
        break;

      case 2: // Pricing
        if (!listingData.pricing.dailyRate) newErrors.dailyRate = 'Daily rate is required';
        if (!listingData.pricing.securityDeposit) newErrors.securityDeposit = 'Security deposit is required';
        break;

      case 3: // Images
        if (listingData.images.length === 0) newErrors.images = 'At least one image is required';
        break;

      case 4: // Availability
        if (listingData.availability.length === 0) newErrors.availability = 'Availability dates are required';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [listingData]);

  const submitListing = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate successful submission
      return { success: true, listingId: Math.random().toString(36).substr(2, 9) };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    listingData,
    currentStep,
    errors,
    loading,
    updateListingData,
    setCurrentStep,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    updateAvailability,
    validateStep,
    submitListing,
  };

  return (
    <ListingContext.Provider value={value}>
      {children}
    </ListingContext.Provider>
  );
};
