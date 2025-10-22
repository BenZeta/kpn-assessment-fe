import useFetch from "@/hooks/useFetch";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import {
  Backdrop,
  CircularProgress,
  Paper,
  Container,
  Typography,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import { BatchHeadAs } from "@/types/AssessmentTypes";
import { useEffect } from "react";
import { isAxiosError } from "axios";

function FetchDataBatchClient() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    data: Batch,
    loading: BatchLoading,
    error,
  } = useFetch<{
    message: string;
    data: BatchHeadAs;
  }>(`/assessment/${token}/genbatchdet`);

  useEffect(() => {
    console.error(error);
  }, [error]);
  if (Batch) {
    return <Outlet />;
  } else if (error) {
    return (
      <Container
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ display: "flex", flexDirection: "column", p: 10 }}>
          <Typography variant="h3">Something went wrong</Typography>
          {error && (
            <Alert severity="error">
              <AlertTitle>Error Message</AlertTitle>
              <em>{isAxiosError(error) ? error.response?.data?.message : error.message}</em>
            </Alert>
          )}
          <Button
            color="error"
            onClick={() => {
              navigate(-1);
            }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  } else {
    return (
      <Backdrop open={true}>
        <CircularProgress />
      </Backdrop>
    );
  }
}

export default FetchDataBatchClient;
