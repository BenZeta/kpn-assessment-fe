import RTEField from "@/components/forms/RTEField";
import { useReportContext } from "@/pages/report/ReportCreateEdit";
import { History } from "@mui/icons-material";
import { Box, Button, Card, CircularProgress, Divider, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import DisplayReportGuides, { RefDisplayReportGuides } from "./DisplayGuides";
import ReportCard, { Category } from "./ReportCard";

type IntroductionProps = {
  control: any;
};

const Introduction: React.FC<IntroductionProps> = ({ control}) => {
  const { data, loading } = useReportContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | HTMLButtonElement | null>(null);
  const refDialogGuides = useRef<RefDisplayReportGuides>(null);
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
      <Card sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <DisplayReportGuides anchorEl={anchorEl} ref={refDialogGuides} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={e => {
              if (refDialogGuides.current) {
                setAnchorEl(e.currentTarget);
                refDialogGuides.current.openModal();
              }
            }}
          >
            <History />
          </Button>
        </Box>
        <RTEField name="content" control={control} style={{ minHeight: "15rem" }} />
      </Card>
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
