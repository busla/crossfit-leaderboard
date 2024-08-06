import { Components } from "@mui/material/styles/components";

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        // root?: React.CSSProperties;
        columnHeader?: React.CSSProperties;
        // menu?: React.CSSProperties;
      };
    };
  }
}
