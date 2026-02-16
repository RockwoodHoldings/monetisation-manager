import { useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import ApiKeyGuide from "./pages/ApiKeyGuide";
import type { AppState } from "./types";

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    apiKey: "",
    universeId: "",
    experienceName: "",
  });

  const navigate = useNavigate();
  const isConfigured = appState.apiKey !== "" && appState.universeId !== "";

  const handleBack = useCallback(() => {
    setAppState({ apiKey: "", universeId: "", experienceName: "" });
    navigate("/");
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Setup appState={appState} setAppState={setAppState} />}
      />
      <Route path="/guide" element={<ApiKeyGuide />} />
      <Route
        path="/dashboard/*"
        element={
          isConfigured ? (
            <Dashboard appState={appState} onBack={handleBack} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
