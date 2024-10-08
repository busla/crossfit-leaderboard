import { Components } from "@mui/material/styles/components";

declare module "@mui/material/styles" {
  interface Components extends Components {
    MuiCssBaseline?: {
      styleOverrides?: {
        body?: React.CSSProperties;
      };
    };
    MuiContainer?: {
      styleOverrides?: {
        root?: React.CSSProperties;
      };
    };
    MuiPaper?: {
      styleOverrides?: {
        root?: React.CSSProperties;
      };
    };
    MuiTabs?: {
      styleOverrides?: {
        root?: React.CSSProperties;
        indicator?: React.CSSProperties;
      };
    };
    MuiTab?: {
      styleOverrides?: {
        root?: React.CSSProperties;
      };
    };
    MuiDataGrid?: {
      styleOverrides?: {
        root?: React.CSSProperties;
        columnHeader?: React.CSSProperties;
        cell?: React.CSSProperties;
      };
    };
  }

  interface Palette {
    custom: {
      softYellow: string;
      footerRight: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      softYellow?: string;
      footerRight?: string;
    };
  }

  interface Theme {
    spacing: (factor: number) => string;
  }

  interface ThemeOptions {
    spacing?: (factor: number) => string;
  }
}
