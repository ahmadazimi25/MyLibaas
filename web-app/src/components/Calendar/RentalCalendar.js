import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import {
  Event,
  Add,
  Google,
  Apple,
  Outlook,
  Download
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { format, addDays } from 'date-fns';

const RentalCalendar = ({ rentals, onAddToCalendar }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDialog, setCalendarDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const generateCalendarEvent = (rental) => {
    const event = {
      google: {
        url: `https://calendar.google.com/calendar/render`,
        params: {
          action: 'TEMPLATE',
          text: `Rental: ${rental.item.title}`,
          dates: `${format(rental.startDate, 'yyyyMMdd')}/${format(rental.endDate, 'yyyyMMdd')}`,
          details: `Rental period for ${rental.item.title}\\nPickup/Delivery: ${rental.deliveryOption}\\nTotal: $${rental.totalPrice}`
        }
      },
      ics: {
        content: [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `DTSTART:${format(rental.startDate, 'yyyyMMdd')}`,
          `DTEND:${format(rental.endDate, 'yyyyMMdd')}`,
          `SUMMARY:Rental: ${rental.item.title}`,
          `DESCRIPTION:Rental period for ${rental.item.title}\\nPickup/Delivery: ${rental.deliveryOption}\\nTotal: $${rental.totalPrice}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\n')
      }
    };

    return event;
  };

  const handleAddToCalendar = (rental, type) => {
    const event = generateCalendarEvent(rental);
    
    if (type === 'google') {
      const params = new URLSearchParams(event.google.params);
      window.open(`${event.google.url}?${params.toString()}`, '_blank');
    } else if (type === 'ics') {
      const blob = new Blob([event.ics.content], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `rental-${rental.id}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setExportDialog(false);
  };

  const getRentalsForDate = (date) => {
    return rentals.filter(rental => {
      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      return date >= rentalStart && date <= rentalEnd;
    });
  };

  const highlightedDays = rentals.reduce((days, rental) => {
    let current = new Date(rental.startDate);
    const end = new Date(rental.endDate);
    
    while (current <= end) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return days;
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1, fontFamily: "'DM Serif Display', serif" }}>
          Rental Calendar
        </Typography>
        <IconButton onClick={() => setCalendarDialog(true)}>
          <Add />
        </IconButton>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          highlightedDays={highlightedDays}
          sx={{
            '& .MuiPickersDay-dayWithMargin': {
              '&.highlighted': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.main',
                }
              }
            }
          }}
        />
      </LocalizationProvider>

      <List>
        {getRentalsForDate(selectedDate).map((rental) => (
          <ListItem key={rental.id}>
            <ListItemText
              primary={rental.item.title}
              secondary={`${format(new Date(rental.startDate), 'MMM d')} - ${format(new Date(rental.endDate), 'MMM d, yyyy')}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => {
                  setSelectedRental(rental);
                  setExportDialog(true);
                }}
              >
                <Event />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Add to Calendar</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => handleAddToCalendar(selectedRental, 'google')}>
              <Google sx={{ mr: 2 }} />
              <ListItemText primary="Google Calendar" />
            </ListItem>
            <ListItem button onClick={() => handleAddToCalendar(selectedRental, 'ics')}>
              <Apple sx={{ mr: 2 }} />
              <ListItemText primary="Apple Calendar" />
            </ListItem>
            <ListItem button onClick={() => handleAddToCalendar(selectedRental, 'ics')}>
              <Outlook sx={{ mr: 2 }} />
              <ListItemText primary="Outlook" />
            </ListItem>
            <ListItem button onClick={() => handleAddToCalendar(selectedRental, 'ics')}>
              <Download sx={{ mr: 2 }} />
              <ListItemText primary="Download .ics file" />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RentalCalendar;
