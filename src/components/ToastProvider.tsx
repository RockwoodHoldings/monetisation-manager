import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type Severity = "success" | "error" | "info";

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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("success");

  const showToast = useCallback((msg: string, sev: Severity = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
    setTimeout(() => setOpen(false), 3000);
  }, []);

  const Icon = icons[severity];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {open && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[300px]",
              styles[severity]
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{message}</span>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
