import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1677ff', // Matching AntD's primary color
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'Lato, sans-serif',
      fontWeight: 700,
    },
  },
});

export default theme;