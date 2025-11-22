// src/context/ToastContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback(
    ({ type = "success", message, duration = 3000 }) => {
      if (!message) return;

      // Bersihkan timeout sebelumnya kalau ada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ type, message });

      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 z-50 flex justify-center sm:justify-end">
          <div
            className={`rounded-xl px-4 py-2 text-sm shadow-lg border ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
