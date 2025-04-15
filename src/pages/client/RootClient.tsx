import { SnackbarProvider } from "@/providers/SnackbarProvider";
import { Outlet } from "react-router-dom";

export default function RootClient() {
  return (
    <SnackbarProvider>
      <Outlet />
    </SnackbarProvider>
  );
}
