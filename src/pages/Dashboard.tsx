import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Ticket, ShoppingCart } from "lucide-react";
import type { AppState } from "../types";
import { fetchUniverseInfo } from "../api/roblox";
import Gamepasses from "./Gamepasses";
import DeveloperProducts from "./DeveloperProducts";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Gamepasses", icon: Ticket, path: "/dashboard/gamepasses" },
  { label: "Developer Products", icon: ShoppingCart, path: "/dashboard/developer-products" },
];

interface Props {
  appState: AppState;
  onBack: () => void;
}

export default function Dashboard({ appState, onBack }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [universeInfo, setUniverseInfo] = useState<{ name: string; iconUrl: string }>({ name: "", iconUrl: "" });

  useEffect(() => {
    fetchUniverseInfo(appState.universeId)
      .then(setUniverseInfo)
      .catch(() => {});
  }, [appState.universeId]);

  return (
    <div>
      {/* AppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center h-full px-4 gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary-light transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold bg-gradient-to-br from-foreground to-primary-light bg-clip-text text-transparent mr-4 truncate max-w-[120px] sm:max-w-none">
            {universeInfo.name || appState.experienceName}
          </h1>

          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const selected = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-3 h-8 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                    selected
                      ? "bg-primary/12 text-primary-light font-semibold"
                      : "text-muted-foreground hover:bg-primary/6"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            {universeInfo.iconUrl && (
              <img
                src={universeInfo.iconUrl}
                alt=""
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {universeInfo.name || appState.experienceName || `Universe ${appState.universeId}`}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-22 px-3 sm:px-6 pb-6">
        <Routes>
          <Route index element={<Navigate to="gamepasses" replace />} />
          <Route path="gamepasses" element={<Gamepasses appState={appState} />} />
          <Route path="developer-products" element={<DeveloperProducts appState={appState} />} />
        </Routes>
      </main>
    </div>
  );
}