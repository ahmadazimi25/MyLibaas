import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A3728', // Dark brown
      light: '#7A5F48',
      dark: '#2C1810',
    },
    secondary: {
      main: '#E6DED5', // Light beige
      light: '#F5F2EE',
      dark: '#D4C8BC',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Libre Baskerville', serif",
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 30,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
