import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Modal from "../components/common/Modal";

interface ErrorModalOptions {
  title?: string;
  description?: string;
}

interface ErrorModalState {
  open: boolean;
  title?: string;
  message?: string;
  description?: string;
}

interface ErrorModalContextValue {
  showError: (message: string, options?: ErrorModalOptions) => void;
  hideError: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextValue | undefined>(undefined);

function cleanMessage(raw: string): string {
  if (!raw) return "Something went wrong.";

  let trimmed = raw.trim();

  // If resembles `Something: 400 Bad Request - {...}` remove status prefix
  const statusSeparator = trimmed.indexOf(" - ");
  if (statusSeparator !== -1) {
    trimmed = trimmed.slice(0, statusSeparator);
  }

  // Attempt to extract nested JSON error if present
  const jsonStart = raw.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const jsonSlice = raw.slice(jsonStart);
      const parsed = JSON.parse(jsonSlice);
      if (typeof parsed?.error === "string") return parsed.error;
      if (typeof parsed?.message === "string") return parsed.message;
      if (typeof parsed?.detail === "string") return parsed.detail;
      if (parsed?.detail && typeof parsed.detail === "object" && typeof parsed.detail.message === "string") {
        return parsed.detail.message;
      }
    } catch {
      // ignore
    }
  }

  // Remove any lingering status codes like `Failed to ...: 400 Bad Request`
  const statusRegex = /:\s*\d{3}\s+[A-Za-z\s]+$/;
  if (statusRegex.test(trimmed)) {
    trimmed = trimmed.replace(statusRegex, "").trim();
  }

  return trimmed || "Something went wrong.";
}

export const ErrorModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ErrorModalState>({ open: false });

  const showError = useCallback((message: string, options?: ErrorModalOptions) => {
    setState({
      open: true,
      title: options?.title ?? "Something went wrong",
      message: cleanMessage(message),
      description: options?.description,
    });
  }, []);

  const hideError = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const value = useMemo<ErrorModalContextValue>(() => ({ showError, hideError }), [showError, hideError]);

  return (
    <ErrorModalContext.Provider value={value}>
      {children}
      <Modal
        open={state.open}
        onClose={hideError}
        title={state.title}
        tone="danger"
        actions={
          <button className="btn" onClick={hideError}>
            Dismiss
          </button>
        }
      >
        <div className="space-y-2 text-sm text-slate-700">
          <p>{state.message}</p>
          {state.description && <p className="text-slate-500">{state.description}</p>}
        </div>
      </Modal>
    </ErrorModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useErrorModal(): ErrorModalContextValue {
  const ctx = useContext(ErrorModalContext);
  if (!ctx) {
    throw new Error("useErrorModal must be used within an ErrorModalProvider");
  }
  return ctx;
}
