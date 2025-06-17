import { Box, Button } from "@mui/material";
import { AxiosError, isAxiosError } from "axios";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export type ErrorPageInterface = {
  error: Error | AxiosError;
};

export default function ErrorPage({ error }: ErrorPageInterface) {
  const { token } = useParams();
  const navigate = useNavigate();
  const message = useMemo(() => {
    if (isAxiosError(error)) {
      return "This subtest already done, please go back to main test";
    }
  }, [error]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>{message}</h2>
      <Button
        onClick={() => {
          navigate(`/client/${token}`);
        }}
      >
        Go Back to Menu Test
      </Button>
    </Box>
  );
}
