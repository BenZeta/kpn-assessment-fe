import { AxiosError, isAxiosError } from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Warning from "@/assets/warning.svg?react";
import { Box, Button } from "@mui/material";
import { useMemo } from "react";

export type ErrorPageInterface = {
  error: Error | AxiosError;
};

export default function ErrorPage({ error }: ErrorPageInterface) {
  // const { id, token } = useParams();
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
          navigate(-3);
        }}
      >
        Go Back to Menu Test
      </Button>
    </Box>
  );
}
