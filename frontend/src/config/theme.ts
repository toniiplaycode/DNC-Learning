import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9F1C", // Orange peel
      light: "#FFBF69", // Hunyadi yellow
      dark: "#2EC4B6", // Light sea green
      contrastText: "#fff",
    },
    secondary: {
      main: "#CBF3F0", // Mint green
      light: "#2EC4B6", // Light sea green
      dark: "#2EC4B6",
      contrastText: "#000",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D1E2F",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FF9F1C", // Orange peel
          color: "#FFFFFF",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#2EC4B6", // Light sea green
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#FF9F1C", // Orange peel
          },
        },
        outlined: {
          borderColor: "#2EC4B6",
          color: "#2EC4B6",
          "&:hover": {
            borderColor: "#FF9F1C",
            backgroundColor: "rgba(255, 159, 28, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        },
      },
    },
  },
});

export default theme;
