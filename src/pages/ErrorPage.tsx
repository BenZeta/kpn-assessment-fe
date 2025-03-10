import { Box, Stack } from "@mui/material";
import { useRouteError, Navigate, ErrorResponse } from "react-router-dom";
import { useEffect } from "react";
import { isAxiosError } from "axios";

export default function ErrorPage() {
  const error = useRouteError() as ErrorResponse;

  useEffect(() => {
    const chunkFailedMessage = /^.*Failed\s+to\s+fetch\s+dynamically\s+imported\s+module.*$/;
    const errorMsg = error as unknown as Error;
    if (errorMsg?.message && chunkFailedMessage.test(errorMsg?.message)) {
      window.location.reload();
    }
  }, [error]);

  if (isAxiosError(error) && error.response?.status === 401) {
    return <Navigate replace to="/login" />;
  }
  return (
    <>
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isAxiosError(error) && (
            <>
              <h1>Error {error.response?.status || error?.status}</h1>
              <h2> {error?.response?.data?.message || error?.statusText}</h2>
            </>
          )}
          {error?.statusText}
        </Stack>
      </Box>
    </>
  );
}
