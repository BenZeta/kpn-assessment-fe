import useFetch from "@/hooks/useFetch";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import React from "react";
import ReportCard, { Category } from "./ReportCard";

type IntroductionProps = {
  control: any;
  batchId?: string;
};

const Introduction: React.FC<IntroductionProps> = ({ control, batchId }) => {
//   console.log("Introduction", batchId);
  const { data, loading } = useFetch<any>(`/report/template/${batchId}`);
  const categories = data?.data;
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Introduction
        </Typography>
        <Typography variant="body1" color="textSecondary" fontWeight={400} sx={{ mt: 2 }}>
          This is the introduction section of the report. Here you can provide an overview of the
          report's purpose, scope, and any other relevant information that will help the reader
          understand the context of the report.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box>
        {categories?.categories.map((category: Category, index: number) => (
          <ReportCard
            key={category.id}
            control={control}
            data={category}
            index={index}
            fieldNamePrefix="intro"
            variant="category"
            showCategoryPrefix={true}
          />
        ))}
      </Box>
    </>
  );
};
export default Introduction;
