import { BoxSkeleton, TableSkeleton } from "@/components/Skeleton";
import LanguageSelector from "@/components/LanguageSelector";
import useFetch from "@/hooks/useFetch";
import useLanguageStore from "@/hooks/useLanguageStore";
import useQNAIdentityStore from "@/hooks/useQNAIdentityStore";
import { API } from "@/utils/api";
import { BatchHeadAs } from "@/types/AssessmentTypes";
import {
  CheckCircleOutline,
  ChevronLeft,
  PlayCircleOutline,
  RadioButtonChecked,
  Schedule,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid2 as Grid,
  Grow,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import parse from "html-react-parser";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type TestStatus = "Completed" | "Not Completed" | "In Progress";

interface TestData {
  test_id: string;
  test_name: string;
  status: TestStatus;
}

const WelcomeClient: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const setIdentity = useQNAIdentityStore(state => state.setIdentity);
  const selectedLanguage = useLanguageStore(state => state.selectedLanguage);
  const [batchTranslations, setBatchTranslations] = useState<Record<string, any>>({});

  const { data: Batch, loading: BatchLoading } = useFetch<{
    message: string;
    data: BatchHeadAs;
  }>(`/assessment/${token}/batch`);
  const {
    data: Test,
    loading: TestLoading,
    refetch,
  } = useFetch<{ data: TestData[] }>(`/assessment/${token}/test`);

  useEffect(() => {
    if (Batch?.data?.batch_id) {
      setIdentity({ batch_id: Batch.data.batch_id });
      refetch();
    }
  }, [Batch, setIdentity, refetch]);

  // Fetch all batch translations on mount
  useEffect(() => {
    const fetchBatchTranslations = async () => {
      if (!Batch?.data.id) return;

      try {
        const response = await API.get(`/public/batch/${Batch?.data.id}/language`);
        if (response.data?.data) {
          setBatchTranslations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch batch translations:", error);
      }
    };

    fetchBatchTranslations();
  }, [Batch?.data?.id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("D MMMM YYYY | HH:mm");
  };

  const getStatusChip = (status: TestStatus) => {
    const chipProps = {
      variant: "outlined" as const,
      title: `Status: ${status}`,
    };

    switch (status) {
      case "Completed":
        return (
          <Chip {...chipProps} icon={<CheckCircleOutline />} label="Completed" color="success" />
        );
      case "In Progress":
        return (
          <Chip {...chipProps} icon={<RadioButtonChecked />} label="In Progress" color="warning" />
        );
      case "Not Completed":
      default:
        return (
          <Chip {...chipProps} icon={<PlayCircleOutline />} label="Not Started" color="info" />
        );
    }
  };

  const getActionButton = (test: TestData) => {
    const commonProps = {
      onClick: () => {
        // Future enhancement: Consider a confirmation modal before navigating.
        navigate(`/client/assessment/${token}/test/${test.test_id}`);
      },
    };

    switch (test.status) {
      case "Completed":
        return null;
      case "In Progress":
        return (
          <Button
            {...commonProps}
            variant="contained"
            color="primary"
            aria-label={`Continue ${test.test_name} test`}
          >
            Continue Test
          </Button>
        );
      case "Not Completed":
      default:
        return (
          <Button
            {...commonProps}
            variant="contained"
            color="primary"
            aria-label={`Start ${test.test_name} test`}
          >
            Start Test
          </Button>
        );
    }
  };

  if (BatchLoading || TestLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <BoxSkeleton />
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <TableSkeleton row={1} column={1} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  const allTestsCompleted = Test?.data?.every(test => test.status === "Completed");

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Button
          onClick={() => navigate("/client/dashboard")}
          variant="outlined"
          startIcon={<ChevronLeft />}
        >
          Back to Main
        </Button>
        <LanguageSelector />
      </Box>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h2" component="h1" fontWeight="700" color="primary">
          KPN Online Assessment Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {Batch?.data?.batch_name}
        </Typography>
      </Box>

      <Alert severity="info" icon={<Schedule fontSize="inherit" />} sx={{ mb: 4 }}>
        <AlertTitle>Assessment Schedule</AlertTitle>
        Available from <strong>{formatDate(Batch?.data?.start_period)}</strong> to{" "}
        <strong>{formatDate(Batch?.data?.end_period)}</strong>.
      </Alert>

      <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: "background.paper" }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {parse(
            batchTranslations[selectedLanguage]?.description || Batch?.data?.description || ""
          )}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {Test?.data?.map((test, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={test.test_id}>
            <Grow in={true} timeout={500 + index * 100}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {test.test_name}
                  </Typography>
                  {getStatusChip(test.status)}
                </CardContent>
                <CardActions sx={{ p: 2, justifyContent: "flex-start" }}>
                  {getActionButton(test)}
                </CardActions>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        {allTestsCompleted ? (
          <Alert severity="success">
            Congratulations! You have completed all assessments. You may now safely close the KPN
            Online Assessment Platform tab.
          </Alert>
        ) : (
          <Typography variant="body1" color="text.secondary">
            After all test statuses are{" "}
            <Typography component="span" color="success.main" fontWeight="bold">
              Completed
            </Typography>
            , you can close the KPN Online Assessment Platform tab.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default WelcomeClient;
