import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212', // Softer black
      paper: '#1E1E1E', // Slightly lighter for raised components
    },
    primary: {
      main: '#FF0000', // Keeping the red accent
    },
    secondary: {
      main: "#FF0000", // Red
    },
    custom: {
      softYellow: "#FFF9C4",
      footerRight: "1rem"
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'linear-gradient(to bottom, #121212, #1A1A1A)', // Subtle gradient
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, #1E1E1E, #252525)', // Subtle gradient for Paper components
          padding: '1.5rem', // Increased padding
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginBottom: '1.5rem', // Increased space below tabs
        },
        indicator: {
          backgroundColor: "#FF0000", // Active tab indicator
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#FFFFFF", // White text color for all tabs
          "&.Mui-selected": {
            color: "#FF0000", // Color for selected tab
          },
          padding: '1rem 1.5rem', // Increased padding for tabs
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none', // Remove border if present
        },
        columnHeader: {
          backgroundColor: "rgba(255, 255, 255, 0.05)", // Slightly lighter background for headers
          padding: '1rem 0.75rem', // Increased padding
        },
        cell: {
          padding: '0.75rem', // Increased cell padding
        },
      },
    },
  },
  spacing: factor => `${0.5 * factor}rem`, // Adjust base spacing
  shape: {
    borderRadius: 8, // Slightly rounded corners
  },
});

export default theme;
