import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3A2618', // Dark brown from the logo
      light: '#5C3D2E',
      dark: '#2A1810',
    },
    secondary: {
      main: '#F5EBE0', // Beige from the background
      light: '#FFFFFF',
      dark: '#E6D5C3',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5EBE0',
    },
    text: {
      primary: '#3A2618',
      secondary: '#5C3D2E',
    },
  },
  typography: {
    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
    h1: {
      fontWeight: 400,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.75rem',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          backgroundColor: '#3A2618',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2A1810',
          },
        },
        outlined: {
          borderColor: '#3A2618',
          color: '#3A2618',
          '&:hover': {
            borderColor: '#2A1810',
            backgroundColor: 'rgba(58, 38, 24, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 25,
          },
        },
      },
    },
  },
});
