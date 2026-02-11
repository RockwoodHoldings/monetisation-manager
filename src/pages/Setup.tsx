import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Rocket, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { AppState } from "../types";
import { getSessions, saveSession, deleteSession, getSavedKeys, addSavedKey, deleteSavedKey } from "../sessions";
import { fetchUniverseInfo } from "../api/roblox";
import { cn } from "@/lib/utils";

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
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const nameManuallyEdited = useRef(false);

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
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center gap-6 py-12 px-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-foreground via-primary-light to-primary bg-clip-text text-transparent mb-3">
          Roblox Universe Manager
        </h1>
        <p className="text-muted-foreground">
          Bulk manage gamepasses and developer products for your experiences.
        </p>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/60 backdrop-blur-sm p-5">
          <button
            onClick={() => setSessionsOpen((v) => !v)}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                !sessionsOpen && "-rotate-90"
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              sessionsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-2 mt-3">
                {sessions.map((s) => (
                  <Card key={s.id} className="bg-card/80">
                    <div className="flex items-center">
                      {sessionInfo.get(s.universeId)?.iconUrl && (
                        <img
                          src={sessionInfo.get(s.universeId)!.iconUrl}
                          alt={s.experienceName}
                          className="w-14 h-14 object-cover m-2 rounded-lg shrink-0"
                        />
                      )}
                      <button
                        onClick={() => handleSessionClick(s)}
                        className="flex-1 text-left px-3 py-3 hover:bg-primary/6 transition-colors rounded-lg cursor-pointer"
                      >
                        <p className="font-semibold text-foreground">
                          {sessionInfo.get(s.universeId)?.name || s.experienceName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Universe {s.universeId} &middot;{" "}
                          {new Date(s.lastUsed).toLocaleDateString()}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="mx-2 p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground text-center">
                Or connect a new experience below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connect Form */}
      <div className="rounded-xl border border-border bg-secondary/60 backdrop-blur-sm p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-foreground">Connect your experience</h2>

        {savedKeys.length > 0 && (
          <div className="space-y-2">
            <Label>Use a saved API key</Label>
            <Select
              value={selectedKeyId || "_manual"}
              onValueChange={(id) => {
                if (id === "_manual") {
                  setSelectedKeyId("");
                } else {
                  setSelectedKeyId(id);
                  const key = savedKeys.find((k) => k.id === id);
                  if (key) setApiKey(key.apiKey);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Enter manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_manual">Enter manually</SelectItem>
                {savedKeys.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{k.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedKey(k.id);
                          setSavedKeys(getSavedKeys());
                          if (selectedKeyId === k.id) {
                            setSelectedKeyId("");
                            setApiKey("");
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Open Cloud API Key</Label>
          <div className="relative">
            <Input
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSelectedKeyId("");
              }}
              type={showKey ? "text" : "password"}
              placeholder="Enter your API key"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create one at create.roblox.com &rarr; Credentials &rarr; API Keys
          </p>
        </div>

        {!selectedKeyId && apiKey.trim() && (
          <div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-key"
                checked={saveKey}
                onCheckedChange={(v) => setSaveKey(v === true)}
              />
              <Label htmlFor="save-key" className="text-sm text-muted-foreground cursor-pointer">
                Save this API key for later
              </Label>
            </div>
            {saveKey && (
              <Input
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
                placeholder='e.g. "My Main Key"'
                className="mt-2"
              />
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Universe ID</Label>
          <Input
            value={universeId}
            onChange={(e) => setUniverseId(e.target.value)}
            placeholder="Enter Universe ID"
          />
          <p className="text-xs text-muted-foreground">
            Found in your game's settings on the Creator Dashboard
          </p>
        </div>

        <div className="space-y-2">
          <Label>Experience Name (optional)</Label>
          <Input
            value={experienceName}
            onChange={(e) => {
              setExperienceName(e.target.value);
              nameManuallyEdited.current = true;
            }}
            placeholder="Auto-filled from Roblox"
          />
          <p className="text-xs text-muted-foreground">
            Auto-filled from Roblox, or enter a friendly label
          </p>
        </div>

        {error && <Alert variant="destructive">{error}</Alert>}

        <Button size="lg" onClick={handleSubmit} className="mt-2">
          <Rocket className="h-4 w-4 mr-2" />
          Launch Manager
        </Button>
      </div>
    </div>
  );
}
