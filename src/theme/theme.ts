// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

// Define our neutral color palette and accent color
const palette = {
  primary: {
    main: "#6d28d9", // A nice purple accent
  },
  background: {
    default: "#f9fafb", // Light gray background
    paper: "#ffffff", // White for cards/drawers
  },
  text: {
    primary: "#1f2937", // Dark gray for text
    secondary: "#6b7280",
  },
};

export const theme = createTheme({
  palette: palette,
  shape: {
    borderRadius: 12, // Corresponds to Tailwind's rounded-xl
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none", // Buttons without uppercase text
      fontWeight: 600,
    },
  },
  components: {
    // Override MuiPaper for our card-like shadow
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Subtle shadow
        },
      },
    },
    // Override MuiButton for a softer look
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // rounded-lg
        },
      },
    },
  },
});
