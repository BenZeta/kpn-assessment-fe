import useFetch from "@/hooks/useFetch";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import React from "react";
import ReportCard, { Category, Test } from "./ReportCard";

type DetailsProps = {
  control: any;
  batchId?: string;
};

const Details: React.FC<DetailsProps> = ({ control, batchId }) => {

    const { data, loading } = useFetch<any>(`/report/template/${batchId}`);
    const categories = data?.data;
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress />
            </Box>
        );
    }
    const allTests = categories.categories.flatMap((category : Category) =>
        category.tests.map(test => ({
            ...test,
            category: category.name,
        }))

    )
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Detail Report
        </Typography>
        <Typography variant="body1" color="textSecondary" fontWeight={400} sx={{ mt: 2 }}>
          This is the introduction section of the report. Here you can provide an overview of the
          report's purpose, scope, and any other relevant information that will help the reader
          understand the context of the report.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box>
        {allTests.map((test: Test) => (
          <ReportCard
            key={test.id}
            control={control}
            data={test}
            variant="test"
            showCategoryPrefix={false}
          />
        ))}
      </Box>
    </> 
  );
};
export default Details;
