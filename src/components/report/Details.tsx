import { useReportContext } from "@/pages/report/ReportCreateEdit";
import { Box, CircularProgress, Container, Divider, Fade, Typography } from "@mui/material";
import React from "react";
import ReportCard, { Category, Test } from "./ReportCard";
import { Assessment } from "@mui/icons-material";
import DataSaverOffIcon from "@mui/icons-material/DataSaverOff";

type DetailsProps = {
  control: any;
  batchId?: string;
};

const Details: React.FC<DetailsProps> = ({ control }) => {
  const { data, loading } = useReportContext();
  const categories = data?.data;
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Loading assessment data...
          </Typography>
        </Box>
      </Container>
    );
  }
  const allTests = categories.categories.flatMap((category: Category) =>
    category.tests.map(test => ({
      ...test,
      category: category.name,
    }))
  );
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Fade in={true} timeout={600}>
        <Box>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <DataSaverOffIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0 }}>
                Detail Assessment
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Configure how your assessment results will be summarized and displayed. Choose the
              appropriate settings for each test and subtest.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {allTests.map((test: Test, index: number) => (
              <Fade key={test.id} in={true} timeout={800 + index * 200}>
                <Box>
                  <ReportCard
                    key={test.id}
                    control={control}
                    data={test}
                    index={index}
                    fieldNamePrefix="details"
                    variant="test"
                    showCategoryPrefix={false}
                  />
                </Box>
              </Fade>
            ))}
          </Box>
          <Box
            sx={{
              mt: 6,
              p: 3,
              backgroundColor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Assessment sx={{ color: "info.main", fontSize: 20 }} />
              <Typography variant="subtitle2" color="info.main">
                Configuration Guide
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Summary Type:</strong> Choose how data is grouped •<strong>Formula:</strong>{" "}
              Select calculation method •<strong>View:</strong> Pick visualization format
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};
export default Details;
