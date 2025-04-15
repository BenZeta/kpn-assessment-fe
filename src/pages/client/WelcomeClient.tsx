import { BoxSkeleton, TableSkeleton } from "@/components/Skeleton";
import useFetch from "@/hooks/useFetch";
import { BatchHeadAs } from "@/types/AssessmentTypes";
import { Box, Grid2 as Grid, Paper, Typography } from "@mui/material";
import { Show } from "@refinedev/mui";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useQNAIdentityStore from "@/hooks/useQNAIdentityStore";

const WelcomeClient: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const setIdentity = useQNAIdentityStore(state => state.setIdentity);

  const { data: Batch, loading: BatchLoading } = useFetch<{ message: string; data: BatchHeadAs }>(
    `/assessment/${token}/batch`
  );
  const { data: Test, loading: TestLoading, refetch } = useFetch<any>(`/assessment/${token}/test`);

  useEffect(() => {
    if (Batch != null) {
      setIdentity({ batch_id: Batch.data.batch_id });
    }
  }, [Batch]);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY | HH:mm");
  };

  useEffect(() => {
    if (Batch != null) {
      refetch();
    }
  }, [Batch]);

  if (BatchLoading || TestLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <BoxSkeleton />
        <TableSkeleton row={4} column={3} />
      </Box>
    );
  }

  return (
    <Show
      title={
        <Box sx={{ width: "100%", textAlign: "center", mb: 2 }}>
          <Typography variant="h5">Welcome to Dashboard</Typography>
          <Typography variant="h2" fontWeight="600" color="primary" sx={{ fontSize: "2.5rem" }}>
            Assessment Process
          </Typography>
        </Box>
      }
      goBack={false}
      headerButtons={false}
      contentProps={{
        sx: {
          p: 0,
          boxShadow: "none",
          background: "transparent",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 0,
          bgcolor: "#c41e1e",
          color: "white",
          p: 1,
          mb: 2,
        }}
      >
        <Typography variant="body1" textAlign="center" fontWeight="medium">
          Schedule Assessment: {Batch?.data?.start_period && formatDate(Batch.data.start_period)} -{" "}
          {Batch?.data?.end_period && formatDate(Batch.data.end_period)}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: 3,
        }}
      >
        <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
          {Batch?.data?.description}
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Grid container spacing={0}>
            <Grid size={{ xs: 9 }}>
              <Paper
                sx={{
                  bgcolor: "#0277bd",
                  color: "white",
                  p: 1,
                  textAlign: "center",
                  borderRadius: 0,
                  mr: 1,
                }}
              >
                <Typography variant="body1">Test Title</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Paper
                sx={{
                  bgcolor: "#0277bd",
                  color: "white",
                  p: 1,
                  textAlign: "center",
                  borderRadius: 0,
                }}
              >
                <Typography variant="body1">Status</Typography>
              </Paper>
            </Grid>

            {/* Introduction Page */}
            {/* <Grid size={{ xs: 9 }}>
              <Paper
                sx={{
                  bgcolor: "#c41e1e",
                  color: "white",
                  p: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 0,
                  mt: 1,
                  mr: 1,
                }}
              >
                <Typography variant="body1">Introduction Page</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Paper
                sx={{
                  bgcolor: "#4caf50",
                  color: "white",
                  p: 1,
                  textAlign: "center",
                  borderRadius: 0,
                  mt: 1,
                }}
              >
                <Typography variant="body1">Completed</Typography>
              </Paper>
            </Grid> */}

            {/* Test Items */}
            {Test?.data?.map((test: any, index: number) => (
              <React.Fragment key={index}>
                <Grid size={{ xs: 9 }}>
                  <Paper
                    sx={{
                      bgcolor: "#c41e1e",
                      color: "white",
                      p: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: 0,
                      mt: 1,
                      mr: 1,
                      ":hover": {
                        bgcolor: "#c41e1e",
                      },
                    }}
                    onClick={() => navigate(`/client/assessment/${token}/test/${test.test_id}`)}
                  >
                    <Typography variant="body1">{test.test_name}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Paper
                    sx={{
                      bgcolor: test.status === "Completed" ? "#4caf50" : "#f44336",
                      color: "white",
                      p: 1,
                      textAlign: "center",
                      borderRadius: 0,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body1">{test.status}</Typography>
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body1">
            After all statuses are{" "}
            <span style={{ color: "#4caf50", fontWeight: "bold" }}>completed</span>, you can leave
            the KPN Corp Assessment Center
          </Typography>
        </Box>
      </Paper>
    </Show>
  );
};

export default WelcomeClient;
