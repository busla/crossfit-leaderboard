import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#FF0000", // Red
    },
    custom: {
      softYellow: "#FFF9C4", // Soft yellow color
      footerRight: "1rm"
    },
  },
  components: {
    MuiTabs: {
      styleOverrides: {
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
            color: "#FF0000", // Optionally change color for selected tab
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        columnHeader: {
          backgroundColor: "#f5f5f5", // Light gray
        },
      },
    },
  },
});

export default theme;
