import useFetch from "@/hooks/useFetch";
import { Box, Paper, Typography, Grid2 as Grid } from "@mui/material";
import { Show } from "@refinedev/mui";
import dayjs from "dayjs";
import React from "react";
import { useParams } from "react-router-dom";

const SubtestClient: React.FC = () => {
  const { id } = useParams();
  const { token } = useParams();
  console.log(id);
  const { data: Batch } = useFetch<any>(`/assessment/${token}/batch`);
  const { data: Subtest } = useFetch<any>(`/assessment/${token}/test/${id}`);
  console.log(JSON.stringify(Subtest, null, 2));
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY | HH:mm");
  };

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
        <Typography variant="body1" textAlign="center" fontWeight="medium">
          {Subtest?.data?.test.description}
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
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
                <Typography variant="body2">Duration</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
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
                <Typography variant="body1">Remark</Typography>
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

            {Subtest?.data?.subtests?.map((subtest: any, index: number) => (
              <React.Fragment key={index}>
                <Grid size={{ xs: 3 }}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: "center",
                      borderRadius: 0,
                    }}
                  >
                    <Typography variant="body2">
                     {subtest.subtest_duration} minutes
                    </Typography>
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
            
          </Grid>
        </Box>
      </Paper>
    </Show>
  );
};
export default SubtestClient;
