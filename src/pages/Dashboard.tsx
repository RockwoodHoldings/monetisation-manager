import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import {
  ConfirmationNumber,
  ShoppingCart,
  ArrowBack,
} from "@mui/icons-material";
import type { AppState } from "../types";
import Gamepasses from "./Gamepasses";
import DeveloperProducts from "./DeveloperProducts";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Gamepasses", icon: <ConfirmationNumber />, path: "/dashboard/gamepasses" },
  { label: "Developer Products", icon: <ShoppingCart />, path: "/dashboard/developer-products" },
];

interface Props {
  appState: AppState;
  onBack: () => void;
}

export default function Dashboard({ appState, onBack }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onBack}
            sx={{ mr: 2, color: "text.secondary", "&:hover": { color: "primary.light" } }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              background: "linear-gradient(135deg, #f0ece0, #e8c56d)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {appState.experienceName}
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: "rgba(212, 168, 67, 0.1)",
              border: "1px solid rgba(212, 168, 67, 0.2)",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: "monospace", fontSize: "0.8rem" }}>
              Universe {appState.universeId}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 1, pt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              pb: 1,
              display: "block",
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            Manage
          </Typography>
          <List disablePadding>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? "primary.light" : "text.secondary",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        <Routes>
          <Route index element={<Placeholder />} />
          <Route path="gamepasses" element={<Gamepasses appState={appState} />} />
          <Route path="developer-products" element={<DeveloperProducts appState={appState} />} />
        </Routes>
      </Box>
    </Box>
  );
}

function Placeholder() {
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 12,
        px: 4,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        Select Gamepasses or Developer Products from the sidebar to get started.
      </Typography>
    </Box>
  );
}
