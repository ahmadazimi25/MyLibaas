import React from 'react';
import { BrowserRouter as Router, Routes, Route, createRoutesFromElements } from 'react-router-dom';
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
import NotificationCenter from './components/Notification/NotificationCenter';
import Footer from './components/Footer/Footer';
import EmailVerification from './components/Auth/EmailVerification';
import PasswordReset from './components/Auth/PasswordReset';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';
import CreateListing from './pages/CreateListing';
import Booking from './pages/Booking';
import BookingDetails from './pages/Booking/BookingDetails';
import IDVerification from './components/Verification/IDVerification';
import AdminVerification from './components/Verification/AdminVerification';
import DamageReport from './components/Damage/DamageReport';
import DisputeForm from './components/Dispute/DisputeForm';
import DisputeDetails from './components/Dispute/DisputeDetails';
import DisputeAnalytics from './components/Analytics/DisputeAnalytics';
import NotificationPreferences from './components/Notification/NotificationPreferences';
import HowItWorks from './components/HowItWorks/HowItWorks';
import BecomeALender from './components/BecomeALender/BecomeALender';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import RentalAgreement from './pages/Legal/RentalAgreement';
import ReturnPolicy from './pages/Legal/ReturnPolicy';
import DataDeletion from './pages/Legal/DataDeletion';

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
                                <Router future={{ 
                                  v7_relativeSplatPath: true,
                                  v7_startTransition: true 
                                }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    minHeight: '100vh'
                                  }}>
                                    <Navbar>
                                      <NotificationCenter />
                                    </Navbar>
                                    <Routes>
                                      {/* Public Routes */}
                                      <Route path="/" element={<Home />} />
                                      <Route path="/browse" element={<Browse />} />
                                      <Route path="/login" element={<Login />} />
                                      <Route path="/signup" element={<Signup />} />
                                      <Route path="/verify-email" element={<EmailVerification />} />
                                      <Route path="/reset-password" element={<PasswordReset />} />
                                      <Route path="/how-it-works" element={<HowItWorks />} />
                                      <Route path="/become-a-lender" element={<BecomeALender />} />
                                      <Route path="/data-deletion" element={<DataDeletion />} />
                                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                      <Route path="/terms-of-service" element={<TermsOfService />} />
                                      <Route path="/rental-agreement" element={<RentalAgreement />} />
                                      <Route path="/return-policy" element={<ReturnPolicy />} />
                                      
                                      {/* Protected Routes */}
                                      <Route
                                        path="/dashboard/*"
                                        element={
                                          <ProtectedRoute>
                                            <Dashboard />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/product/:id"
                                        element={
                                          <ProtectedRoute>
                                            <ProductDetails />
                                          </ProtectedRoute>
                                        }
                                      />
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
                                        path="/booking-details/:id"
                                        element={
                                          <ProtectedRoute>
                                            <BookingDetails />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/verify-id"
                                        element={
                                          <ProtectedRoute>
                                            <IDVerification />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/admin/verifications"
                                        element={
                                          <ProtectedRoute>
                                            <AdminVerification />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/report-damage/:bookingId"
                                        element={
                                          <ProtectedRoute>
                                            <DamageReport />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/disputes/new/:bookingId"
                                        element={
                                          <ProtectedRoute>
                                            <DisputeForm />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/disputes/:disputeId"
                                        element={
                                          <ProtectedRoute>
                                            <DisputeDetails />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/settings/notifications"
                                        element={
                                          <ProtectedRoute>
                                            <NotificationPreferences />
                                          </ProtectedRoute>
                                        }
                                      />
                                      <Route
                                        path="/admin/analytics/disputes"
                                        element={
                                          <ProtectedRoute>
                                            <DisputeAnalytics />
                                          </ProtectedRoute>
                                        }
                                      />
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
