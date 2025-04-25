import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CreditCard as CardIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { usePayment } from '../../contexts/PaymentContext';
import PaymentMethodForm from './PaymentMethodForm';

const PaymentMethodCard = ({
  method,
  isDefault,
  onSetDefault,
  onDelete,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(method.id);
  };

  const getCardIcon = (brand) => {
    // You can import and use specific card brand icons here
    return <CardIcon />;
  };

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        bgcolor: isDefault ? 'action.selected' : 'background.paper',
      }}
    >
      <Radio
        checked={isDefault}
        onChange={() => onSetDefault(method.id)}
        sx={{ mr: 1 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        {getCardIcon(method.card.brand)}
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1">
            {method.card.brand.charAt(0).toUpperCase() +
              method.card.brand.slice(1)}{' '}
            ending in {method.card.last4}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expires {method.card.expMonth}/{method.card.expYear}
          </Typography>
        </Box>
      </Box>
      <IconButton
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isDefault}
      >
        <DeleteIcon />
      </IconButton>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Payment Method</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this payment method? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const PaymentMethods = () => {
  const {
    loading,
    error,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePayment();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const result = await getPaymentMethods();
    if (result.success) {
      setPaymentMethods(result.paymentMethods);
    }
  };

  const handleAddPaymentMethod = async (paymentMethod) => {
    setActionError(null);
    const result = await addPaymentMethod(paymentMethod.id);
    if (result.success) {
      await fetchPaymentMethods();
      setAddDialogOpen(false);
    } else {
      setActionError(result.error);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    setActionError(null);
    const result = await removePaymentMethod(paymentMethodId);
    if (result.success) {
      await fetchPaymentMethods();
    } else {
      setActionError(result.error);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    setActionError(null);
    const result = await setDefaultPaymentMethod(paymentMethodId);
    if (result.success) {
      await fetchPaymentMethods();
    } else {
      setActionError(result.error);
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Payment Methods</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add New Card
        </Button>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Stack spacing={2}>
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isDefault={method.isDefault}
            onSetDefault={handleSetDefaultPaymentMethod}
            onDelete={handleRemovePaymentMethod}
          />
        ))}
        {paymentMethods.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No payment methods added yet
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Your First Card
            </Button>
          </Paper>
        )}
      </Stack>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <PaymentMethodForm onSuccess={handleAddPaymentMethod} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PaymentMethods;
