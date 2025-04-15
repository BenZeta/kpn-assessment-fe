import DialogComp from "@/components/Dialog";
import { BoxSkeleton, TableSkeleton } from "@/components/Skeleton";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { Box, Button, Grid2 as Grid, Paper, Typography } from "@mui/material";
import { Show } from "@refinedev/mui";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SubtestClient: React.FC = () => {
  const { id } = useParams();
  const { token } = useParams();
  const navigate = useNavigate();
  const { data: Batch, loading: BatchLoading } = useFetch<any>(`/assessment/${token}/batch`);
  const { data: Subtest, loading: SubtestLoading } = useFetch<any>(
    `/assessment/${token}/test/${id}`
  );
  // console.log(JSON.stringify(Subtest, null, 2));
  const [selectedCard, setSelectedCard] = useState<any>(null);
  console.log(JSON.stringify(Subtest, null, 2));
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY | HH:mm");
  };

  const handleOpenDialog = (id: string, subtest_name: string) => {
    setSelectedCard({ id, subtest_name });
    open();
  };

  const handleAttempt = () => {
    navigate(`/client/assessment/${token}/subtest/${selectedCard.id}/termspp`);
  };

  const { open, isOpen, close } = useDialog();

  if (BatchLoading || SubtestLoading) {
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
        <Typography variant="body1" textAlign="center" fontWeight="medium" sx={{ mb: 4 }}>
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
                <Typography variant="body1">Subtest Title</Typography>
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
                    <Typography variant="body2">{subtest.subtest_duration}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: "#c41e1e",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 0,
                      mr: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenDialog(subtest.id, subtest.subtest_name)}
                  >
                    <Typography variant="body1">{subtest.subtest_name}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Paper
                    sx={{
                      bgcolor: subtest.status === "Completed" ? "#4caf50" : "#f44336",
                      color: "white",
                      p: 1,
                      textAlign: "center",
                      borderRadius: 0,
                    }}
                  >
                    <Typography variant="body1">{subtest.status}</Typography>
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body1">
              After all status are{" "}
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>completed</span>, you can
              choose another Test
            </Typography>
          </Box>
          <DialogComp
            title="Attempt Subtest"
            open={isOpen}
            onClose={close}
            actions={
              <>
                <Button onClick={close} variant="outlined" color="error">
                  Cancel
                </Button>
                {selectedCard && (
                  <Button onClick={handleAttempt} variant="contained" color="error">
                    Attempt
                  </Button>
                )}
              </>
            }
          >
            {selectedCard && (
              <Typography>{`Are you sure you want to attempt ${selectedCard.subtest_name}?`}</Typography>
            )}
          </DialogComp>
        </Box>
      </Paper>
    </Show>
  );
};
export default SubtestClient;
