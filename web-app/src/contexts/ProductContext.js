import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext(null);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProduct = {
        id: productId,
        title: 'Sample Traditional Dress',
        description: 'A beautiful traditional dress perfect for special occasions.',
        category: 'Traditional Wear',
        occasion: ['Wedding', 'Cultural Event'],
        style: ['Traditional', 'Formal'],
        season: 'All Season',
        brand: 'Traditional Couture',
        size: {
          category: "Women's",
          standard: 'M',
          measurements: {
            bust: 92,
            waist: 74,
            hips: 98,
            length: 140
          }
        },
        pricing: {
          dailyRate: 75,
          weeklyRate: 450,
          eventRate: 250,
          securityDeposit: 200,
          cleaningFee: 25
        },
        shipping: {
          localPickup: true,
          shipping: true,
          shippingFee: 15,
          availableProvinces: ['Ontario', 'Quebec']
        },
        condition: {
          rating: 'Like New',
          altered: false,
          alterationDetails: '',
          lastCleaned: new Date('2025-04-01'),
          flaws: []
        },
        images: [
          {
            url: 'https://picsum.photos/800/1200?random=1',
            alt: 'Front view',
            isPrimary: true
          },
          {
            url: 'https://picsum.photos/800/1200?random=2',
            alt: 'Back view',
            isPrimary: false
          },
          {
            url: 'https://picsum.photos/800/1200?random=3',
            alt: 'Detail view',
            isPrimary: false
          }
        ],
        availability: [
          {
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-05-07'),
            isBooked: false
          },
          {
            startDate: new Date('2025-05-08'),
            endDate: new Date('2025-05-14'),
            isBooked: true
          }
        ],
        lenderId: '123',
        lender: {
          name: 'Sarah Smith',
          rating: 4.8,
          reviews: 24,
          responseRate: 98,
          responseTime: '< 1 hour'
        },
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-04-01')
      };

      setCurrentProduct(mockProduct);
    } catch (err) {
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful creation
      const newProduct = {
        id: Math.random().toString(36).substr(2, 9),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return { success: true, product: newProduct };
    } catch (err) {
      setError(err.message || 'Failed to create product');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (productId, updates) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProduct = {
        ...currentProduct,
        ...updates,
        updatedAt: new Date()
      };
      
      setCurrentProduct(updatedProduct);
      return { success: true, product: updatedProduct };
    } catch (err) {
      setError(err.message || 'Failed to update product');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  const value = {
    currentProduct,
    loading,
    error,
    fetchProduct,
    createProduct,
    updateProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
