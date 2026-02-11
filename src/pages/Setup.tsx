import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  RocketLaunch,
  Delete,
} from "@mui/icons-material";
import type { AppState } from "../types";
import { getSessions, saveSession, deleteSession, getSavedKeys, addSavedKey, deleteSavedKey } from "../sessions";
import { fetchUniverseInfo } from "../api/roblox";

interface Props {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function Setup({ appState, setAppState }: Props) {
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(appState.apiKey);
  const [universeId, setUniverseId] = useState(appState.universeId);
  const [experienceName, setExperienceName] = useState(appState.experienceName);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState(getSessions);
  const [savedKeys, setSavedKeys] = useState(getSavedKeys);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [saveKey, setSaveKey] = useState(false);
  const [keyLabel, setKeyLabel] = useState("");
  const [sessionInfo, setSessionInfo] = useState<Map<string, { name: string; iconUrl: string }>>(new Map());
  const nameManuallyEdited = useRef(false);

  // Fetch session info (names + icons) on mount
  useEffect(() => {
    const ids = [...new Set(sessions.map((s) => s.universeId))];
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map((id) => fetchUniverseInfo(id).then((info) => [id, info] as const)))
      .then((entries) => {
        if (cancelled) return;
        const map = new Map<string, { name: string; iconUrl: string }>();
        for (const [id, info] of entries) {
          map.set(id, info);
        }
        setSessionInfo(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sessions]);

  // Auto-fetch universe name when universe ID changes
  useEffect(() => {
    if (nameManuallyEdited.current) return;
    const id = universeId.trim();
    if (!id || isNaN(Number(id))) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      fetchUniverseInfo(id).then((info) => {
        if (!cancelled && info.name) {
          setExperienceName(info.name);
        }
      }).catch(() => {});
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [universeId]);

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    if (!universeId.trim() || isNaN(Number(universeId))) {
      setError("A valid Universe ID is required.");
      return;
    }
    if (saveKey && !keyLabel.trim()) {
      setError("Please enter a label for the saved key.");
      return;
    }
    setError("");

    if (saveKey) {
      addSavedKey(keyLabel.trim(), apiKey.trim());
      setSavedKeys(getSavedKeys());
      setSaveKey(false);
      setKeyLabel("");
    }

    const name = experienceName.trim() || `Universe ${universeId.trim()}`;
    saveSession({
      apiKey: apiKey.trim(),
      universeId: universeId.trim(),
      experienceName: name,
    });

    setAppState({
      apiKey: apiKey.trim(),
      universeId: universeId.trim(),
      experienceName: name,
    });
    navigate("/dashboard");
  };

  const handleSessionClick = (session: (typeof sessions)[0]) => {
    saveSession({
      apiKey: session.apiKey,
      universeId: session.universeId,
      experienceName: session.experienceName,
    });
    setAppState({
      apiKey: session.apiKey,
      universeId: session.universeId,
      experienceName: session.experienceName,
    });
    navigate("/dashboard");
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          py: 6,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #f0ece0 0%, #e8c56d 50%, #d4a843 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1.5,
            }}
          >
            Roblox Universe Manager
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Bulk manage gamepasses and developer products for your experiences.
          </Typography>
        </Box>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Paper
            sx={{
              p: 3,
              background: "rgba(19, 19, 14, 0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "text.primary" }}>
              Recent Sessions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {sessions.map((s) => (
                <Card
                  key={s.id}
                  sx={{
                    bgcolor: "rgba(26, 26, 20, 0.8)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "stretch" }}>
                    {sessionInfo.get(s.universeId)?.iconUrl && (
                      <CardMedia
                        component="img"
                        sx={{ width: 56, height: 56, objectFit: "cover", m: 1, borderRadius: 1.5, flexShrink: 0, alignSelf: "center" }}
                        image={sessionInfo.get(s.universeId)!.iconUrl}
                        alt={s.experienceName}
                      />
                    )}
                    <CardActionArea onClick={() => handleSessionClick(s)} sx={{ flex: 1 }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "text.primary" }}>
                          {sessionInfo.get(s.universeId)?.name || s.experienceName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Universe {s.universeId} &middot;{" "}
                          {new Date(s.lastUsed).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSession(s.id)}
                      sx={{
                        alignSelf: "center",
                        mx: 1,
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
            <Divider sx={{ mt: 3, mb: 1 }} />
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 1, color: "text.secondary" }}
            >
              Or connect a new experience below
            </Typography>
          </Paper>
        )}

        {/* Connect Form */}
        <Paper
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            background: "rgba(19, 19, 14, 0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            Connect your experience
          </Typography>

          {savedKeys.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Use a saved API key</InputLabel>
              <Select
                value={selectedKeyId}
                label="Use a saved API key"
                onChange={(e) => {
                  const id = e.target.value as string;
                  setSelectedKeyId(id);
                  if (id) {
                    const key = savedKeys.find((k) => k.id === id);
                    if (key) setApiKey(key.apiKey);
                  }
                }}
                renderValue={(id) => {
                  const key = savedKeys.find((k) => k.id === id);
                  return key?.label ?? "";
                }}
              >
                <MenuItem value="">
                  <em>Enter manually</em>
                </MenuItem>
                {savedKeys.map((k) => (
                  <MenuItem key={k.id} value={k.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{k.label}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedKey(k.id);
                        setSavedKeys(getSavedKeys());
                        if (selectedKeyId === k.id) {
                          setSelectedKeyId("");
                          setApiKey("");
                        }
                      }}
                      sx={{ ml: 2, color: "text.secondary", "&:hover": { color: "error.main" } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Open Cloud API Key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSelectedKeyId("");
            }}
            type={showKey ? "text" : "password"}
            fullWidth
            helperText="Create one at create.roblox.com → Credentials → API Keys"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowKey(!showKey)} edge="end" sx={{ color: "text.secondary" }}>
                      {showKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {!selectedKeyId && apiKey.trim() && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveKey}
                    onChange={(e) => setSaveKey(e.target.checked)}
                    sx={{
                      color: "rgba(212, 168, 67, 0.5)",
                      "&.Mui-checked": { color: "#d4a843" },
                    }}
                  />
                }
                label="Save this API key for later"
              />
              {saveKey && (
                <TextField
                  label="Key Label"
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder='e.g. "My Main Key"'
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          )}

          <TextField
            label="Universe ID"
            value={universeId}
            onChange={(e) => setUniverseId(e.target.value)}
            fullWidth
            helperText="Found in your game's settings on the Creator Dashboard"
          />

          <TextField
            label="Experience Name (optional)"
            value={experienceName}
            onChange={(e) => {
              setExperienceName(e.target.value);
              nameManuallyEdited.current = true;
            }}
            fullWidth
            helperText="Auto-filled from Roblox, or enter a friendly label"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            size="large"
            startIcon={<RocketLaunch />}
            onClick={handleSubmit}
            sx={{ mt: 1, py: 1.5 }}
          >
            Launch Manager
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
