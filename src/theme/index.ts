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
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          padding: '1rem 2rem',
          border: '1px solid #EAEAEA',
          color: '#EAEAEA',
          '&:hover': {
            backgroundColor: '#EAEAEA',
            color: '#050505',
          },
        },
      },
    },
  },
});

export default responsiveFontSizes(xoiceTheme);
