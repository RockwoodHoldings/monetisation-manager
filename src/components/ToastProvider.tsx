import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type Severity = "success" | "error" | "info";
type Phase = "idle" | "entering" | "exiting";

interface ToastContextValue {
  showToast: (message: string, severity?: Severity) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const icons: Record<Severity, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles: Record<Severity, string> = {
  success: "border-success/50 bg-success/10 text-success",
  error: "border-destructive/50 bg-destructive/10 text-destructive",
  info: "border-primary/50 bg-primary/10 text-primary-light",
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("success");
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = useCallback(() => {
    setPhase("exiting");
    exitTimer.current = setTimeout(() => setPhase("idle"), 300);
  }, []);

  const showToast = useCallback((msg: string, sev: Severity = "success") => {
    clearTimeout(dismissTimer.current);
    clearTimeout(exitTimer.current);
    setMessage(msg);
    setSeverity(sev);
    setPhase("entering");
    dismissTimer.current = setTimeout(dismiss, 3000);
  }, [dismiss]);

  useEffect(() => {
    return () => {
      clearTimeout(dismissTimer.current);
      clearTimeout(exitTimer.current);
    };
  }, []);

  const Icon = icons[severity];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {phase !== "idle" && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] duration-300",
            phase === "exiting"
              ? "animate-out fade-out slide-out-to-bottom-4"
              : "animate-in fade-in slide-in-from-bottom-4"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[300px]",
              styles[severity]
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{message}</span>
            <button
              onClick={dismiss}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
