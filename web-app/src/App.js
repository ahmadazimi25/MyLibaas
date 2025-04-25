import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import { Box } from '@mui/material';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { ProductProvider } from './contexts/ProductContext';
import { ListingProvider } from './contexts/ListingContext';
import { BookingProvider } from './contexts/BookingContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { VerificationProvider } from './contexts/VerificationContext';
import { DamageProvider } from './contexts/DamageContext';
import { DisputeProvider } from './contexts/DisputeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PrivateRoute from './components/PrivateRoute';
import NotificationCenter from './components/Notification/NotificationCenter';
import NotificationPreferences from './components/Notification/NotificationPreferences';
import DisputeAnalytics from './components/Analytics/DisputeAnalytics';
import Footer from './components/Footer/Footer';
import HowItWorks from './components/HowItWorks/HowItWorks';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ProductDetails from './pages/ProductDetails';
import CreateListing from './pages/CreateListing';
import Booking from './pages/Booking';
import BookingDetails from './pages/Booking/BookingDetails';
import Dashboard from './pages/Dashboard';
import IDVerification from './components/Verification/IDVerification';
import AdminVerification from './components/Verification/AdminVerification';
import DamageReport from './components/Damage/DamageReport';
import DisputeForm from './components/Dispute/DisputeForm';
import DisputeDetails from './components/Dispute/DisputeDetails';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import RentalAgreement from './pages/Legal/RentalAgreement';
import ReturnPolicy from './pages/Legal/ReturnPolicy';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <SearchProvider>
            <ProductProvider>
              <ListingProvider>
                <BookingProvider>
                  <DashboardProvider>
                    <ReviewProvider>
                      <PaymentProvider>
                        <VerificationProvider>
                          <DamageProvider>
                            <DisputeProvider>
                              <NotificationProvider>
                                <Router>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    minHeight: '100vh'
                                  }}>
                                    <Navbar>
                                      <NotificationCenter />
                                    </Navbar>
                                    <Routes>
                                      <Route path="/" element={<Home />} />
                                      <Route path="/browse" element={<Browse />} />
                                      <Route path="/login" element={<Login />} />
                                      <Route path="/signup" element={<Signup />} />
                                      <Route path="/items/:id" element={<ProductDetails />} />
                                      <Route
                                        path="/create-listing"
                                        element={
                                          <ProtectedRoute>
                                            <CreateListing />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/booking/:id"
                                        element={
                                          <ProtectedRoute>
                                            <Booking />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/bookings/:id"
                                        element={
                                          <ProtectedRoute>
                                            <BookingDetails />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/dashboard/*"
                                        element={
                                          <PrivateRoute>
                                            <Dashboard />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/verify"
                                        element={
                                          <PrivateRoute>
                                            <IDVerification />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/admin/verifications"
                                        element={
                                          <PrivateRoute adminOnly>
                                            <AdminVerification />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/report-damage/:bookingId"
                                        element={
                                          <PrivateRoute>
                                            <DamageReport />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/disputes/new/:bookingId"
                                        element={
                                          <PrivateRoute>
                                            <DisputeForm />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/disputes/:disputeId"
                                        element={
                                          <PrivateRoute>
                                            <DisputeDetails />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/settings/notifications"
                                        element={
                                          <PrivateRoute>
                                            <NotificationPreferences />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route
                                        path="/admin/analytics/disputes"
                                        element={
                                          <PrivateRoute adminOnly>
                                            <DisputeAnalytics />
                                          </PrivateRoute>
                                        }
                                      />
                                      <Route path="/how-it-works" element={<HowItWorks />} />
                                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                      <Route path="/terms" element={<TermsOfService />} />
                                      <Route path="/rental-agreement" element={<RentalAgreement />} />
                                      <Route path="/return-policy" element={<ReturnPolicy />} />
                                    </Routes>
                                    <Footer />
                                  </Box>
                                </Router>
                              </NotificationProvider>
                            </DisputeProvider>
                          </DamageProvider>
                        </VerificationProvider>
                      </PaymentProvider>
                    </ReviewProvider>
                  </DashboardProvider>
                </BookingProvider>
              </ListingProvider>
            </ProductProvider>
          </SearchProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
