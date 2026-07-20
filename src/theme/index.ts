import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const xoiceTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E0A458',
    },
    background: {
      default: '#050505',
      paper: '#080808',
    },
    text: {
      primary: '#EAEAEA',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    h1: {
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    button: {
      fontFamily: "'Space Grotesk', monospace",
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      easeOut: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      sharp: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '@media (min-width: 900px)': {
            cursor: 'none',
          },
          overflowX: 'hidden',
        },
        '*:focus-visible': {
          outline: '2px solid #E0A458',
          outlineOffset: '2px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          cursor: 'auto',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          padding: '0.75rem 1.75rem',
          border: '1px solid #EAEAEA',
          color: '#EAEAEA',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          transition: 'all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1)',
          '&:hover': {
            backgroundColor: '#EAEAEA',
            color: '#050505',
            borderColor: '#EAEAEA',
          },
        },
        contained: {
          border: 'none',
          bgcolor: 'primary.main',
          color: '#050505',
          '&:hover': {
            bgcolor: 'primary.main',
            filter: 'brightness(1.1)',
            boxShadow: '0 0 20px rgba(224,164,88,0.3)',
          },
          '&.Mui-disabled': {
            bgcolor: 'rgba(224,164,88,0.3)',
            color: 'rgba(0,0,0,0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(234,234,234,0.2)',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(224,164,88,0.08)',
            color: 'primary.main',
          },
        },
      },
    },
  },
});

export default responsiveFontSizes(xoiceTheme);
