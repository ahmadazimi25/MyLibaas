import React, { createContext, useContext, useState, useCallback } from 'react';
import { PROVINCES, CATEGORIES, OCCASIONS, SEASONS, CONDITION_RATINGS } from '../types';

const SearchContext = createContext(null);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    location: {
      province: '',
      postalCode: '',
      maxDistance: 0, // 0 means nationwide
    },
    category: '',
    size: {
      category: '', // Women's, Men's, Kids'
      standard: '', // S, M, L, XL, etc.
    },
    priceRange: {
      min: 0,
      max: 1000,
    },
    dates: {
      start: null,
      end: null,
    },
    occasion: '',
    season: '',
    condition: '',
    shipping: {
      localPickup: false,
      shipping: true,
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance'); // relevance, price-asc, price-desc, newest

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      location: {
        province: '',
        postalCode: '',
        maxDistance: 0,
      },
      category: '',
      size: {
        category: '',
        standard: '',
      },
      priceRange: {
        min: 0,
        max: 1000,
      },
      dates: {
        start: null,
        end: null,
      },
      occasion: '',
      season: '',
      condition: '',
      shipping: {
        localPickup: false,
        shipping: true,
      },
    });
    setSearchQuery('');
  }, []);

  const getFilterOptions = useCallback(() => ({
    provinces: PROVINCES,
    categories: CATEGORIES,
    occasions: OCCASIONS,
    seasons: SEASONS,
    conditions: CONDITION_RATINGS,
    sortOptions: [
      { value: 'relevance', label: 'Most Relevant' },
      { value: 'price-asc', label: 'Price: Low to High' },
      { value: 'price-desc', label: 'Price: High to Low' },
      { value: 'newest', label: 'Newest First' },
    ],
  }), []);

  // Function to build search query parameters
  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (filters.location.province) params.set('province', filters.location.province);
    if (filters.location.postalCode) params.set('postal', filters.location.postalCode);
    if (filters.category) params.set('category', filters.category);
    if (filters.size.category) params.set('sizeCategory', filters.size.category);
    if (filters.size.standard) params.set('size', filters.size.standard);
    if (filters.priceRange.min > 0) params.set('minPrice', filters.priceRange.min.toString());
    if (filters.priceRange.max < 1000) params.set('maxPrice', filters.priceRange.max.toString());
    if (filters.dates.start) params.set('startDate', filters.dates.start.toISOString());
    if (filters.dates.end) params.set('endDate', filters.dates.end.toISOString());
    if (filters.occasion) params.set('occasion', filters.occasion);
    if (filters.season) params.set('season', filters.season);
    if (filters.condition) params.set('condition', filters.condition);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    
    return params.toString();
  }, [filters, searchQuery, sortBy]);

  const value = {
    filters,
    updateFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    getFilterOptions,
    buildSearchParams,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
