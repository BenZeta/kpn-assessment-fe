import { createContext, useState, useCallback, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackMethod {
  success: (msg: string, persist?: boolean) => void | null;
  error: (msg: string, persist?: boolean) => void | null;
  info: (msg: string, persist?: boolean) => void | null;
  warning: (msg: string, persist?: boolean) => void | null;
}

interface SnackbarState {
  isOpen: boolean;
  message: string;
  severity: "info" | "success" | "warning" | "error";
  persist: boolean;
}

// Singleton snack object
const snack: SnackMethod = {
  success: () => null,
  error: () => null,
  warning: () => null,
  info: () => null,
};

// Create the context (optional if you want to still use useSnackbar in some places)
const SnackbarContext = createContext<SnackMethod | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isOpen: false,
    message: "",
    severity: "info", // can be 'success', 'error', 'warning', or 'info'
    persist: false,
  });

  // Show a snackbar with a specific message and severity
  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "info", persist: boolean = false) => {
      setSnackbar({
        isOpen: true,
        message,
        severity,
        persist,
      });
    },
    []
  );

  // Close the snackbar
  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Assign the snack methods to the singleton
  snack.success = (msg, persist) => showSnackbar(msg, "success", persist);
  snack.error = (msg, persist) => showSnackbar(msg, "error", persist);
  snack.info = (msg, persist) => showSnackbar(msg, "info", persist);
  snack.warning = (msg, persist) => showSnackbar(msg, "warning", persist);

  return (
    <SnackbarContext.Provider value={snack}>
      {children}
      <Snackbar
        open={snackbar.isOpen}
        autoHideDuration={snackbar.persist ? null : 2000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          variant="filled"
          severity={snackbar.severity}
          sx={{ width: "100%", color: "white" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Export the singleton snack
export { snack };
