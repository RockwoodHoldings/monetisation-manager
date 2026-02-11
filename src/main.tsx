import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#d4a843", light: "#e8c56d", dark: "#b8892e" },
    secondary: { main: "#e8c56d" },
    background: { default: "#0a0a08", paper: "#13130e" },
    divider: "rgba(212, 168, 67, 0.12)",
    text: {
      primary: "#f0ece0",
      secondary: "#8b8778",
    },
    success: { main: "#22c55e" },
    error: { main: "#ef4444" },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    body2: { color: "#8b8778" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 67, 0.06) 0%, transparent 60%)",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(212, 168, 67, 0.12)",
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1a1a14",
          border: "1px solid rgba(212, 168, 67, 0.12)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            borderColor: "rgba(212, 168, 67, 0.3)",
            boxShadow: "0 0 20px rgba(212, 168, 67, 0.06)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "8px 20px",
        },
        contained: {
          background: "linear-gradient(135deg, #d4a843 0%, #e8c56d 100%)",
          color: "#0a0a08",
          boxShadow: "0 4px 14px rgba(212, 168, 67, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #c49a38 0%, #d4b45a 100%)",
            boxShadow: "0 6px 20px rgba(212, 168, 67, 0.4)",
          },
        },
        outlined: {
          borderColor: "rgba(212, 168, 67, 0.4)",
          "&:hover": {
            borderColor: "#d4a843",
            backgroundColor: "rgba(212, 168, 67, 0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": {
              borderColor: "rgba(212, 168, 67, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(212, 168, 67, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#d4a843",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& fieldset": {
            borderColor: "rgba(212, 168, 67, 0.2)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(212, 168, 67, 0.4)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#d4a843",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(10, 10, 8, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(212, 168, 67, 0.12)",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0e0e0a",
          borderRight: "1px solid rgba(212, 168, 67, 0.12)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(212, 168, 67, 0.12)",
            "&:hover": {
              backgroundColor: "rgba(212, 168, 67, 0.18)",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(212, 168, 67, 0.06)",
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#8b8778",
          minWidth: 40,
          ".Mui-selected &": {
            color: "#e8c56d",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#13130e",
          border: "1px solid rgba(212, 168, 67, 0.15)",
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "rgba(212, 168, 67, 0.15)",
        },
        bar: {
          borderRadius: 6,
          background: "linear-gradient(90deg, #d4a843, #e8c56d)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(212, 168, 67, 0.12)",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#d4a843",
            "& + .MuiSwitch-track": {
              backgroundColor: "#d4a843",
            },
          },
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
