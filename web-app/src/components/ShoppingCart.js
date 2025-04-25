import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Button,
  Box,
  Divider,
  Dialog
} from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import Checkout from './Checkout';

const ShoppingCart = ({ open, onClose, cartItems, onRemoveFromCart }) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutComplete = () => {
    setCheckoutOpen(false);
    onClose();
    // Here you would typically clear the cart and save the order
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: '100%', maxWidth: 360, bgcolor: 'background.default' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Shopping Cart</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          {cartItems.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              Your cart is empty
            </Typography>
          ) : (
            <>
              <List>
                {cartItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => onRemoveFromCart(item._id)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={item.imageUrl || 'https://via.placeholder.com/40x40'} 
                          variant="rounded"
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Size: {item.size}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              ${item.price}/day
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Total: ${total}/day
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog
        fullScreen
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      >
        <Checkout 
          cartItems={cartItems} 
          onCheckoutComplete={handleCheckoutComplete}
        />
      </Dialog>
    </>
  );
};

export default ShoppingCart;
