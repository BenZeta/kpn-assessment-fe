import { createTheme } from "@mui/material/styles";

// Extend the TypographyVariants interface
declare module "@mui/material/styles" {
  interface TypographyVariants {
    display: React.CSSProperties;
  }

  // Allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    display?: React.CSSProperties;
  }
}

// Add the custom 'display' variant to the Typography component
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display: true;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#b91f27",
    },
    secondary: {
      main: "#D9BD75",
    },
    error: {
      main: "#5d0f0f",
    },
    warning: {
      main: "#f57c00",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#388e3c",
    },
    background: {
      default: "#E5E7EB",
      paper: "#FFFFFF",
    },
    
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    display: {
      fontSize: "6rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    h1: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
  },
});

export default theme;
