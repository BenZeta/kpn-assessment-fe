import { Box, MenuItem, Paper, Typography, Grid2 as Grid } from "@mui/material";
import React from "react";
import SelectCtrl from "../forms/Select";

export type Test = {
  id: string;
  name: string;
  code: string;
  subtests?: SubTest[];
};

type SubTest = {
  id: string;
  name: string;
  code: string;
};

export type Category = {
  id: number;
  name: string;
  code: string;
  tests: Test[];
  testCount: number;
};

type ReportCardProps = {
  control: any;
  data: Category | Test;
  variant: "category" | "test";
  index: number;
  fieldNamePrefix: string;
  defaultSummaryBy?: string;
  defaultSummaryFormula?: string;
  defaultSummaryView?: string;
  showCategoryPrefix?: boolean;
};

const ReportCard: React.FC<ReportCardProps> = ({
  variant,
  data,
  showCategoryPrefix,
  control,
  index,
  fieldNamePrefix,
}) => {
  const renderTitle = () => {
    if (variant === "category") {
      const category = data as Category;
      return (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {showCategoryPrefix ? `Category: ${category.name}` : category.name}
        </Typography>
      );
    } else {
      const test = data as Test;
      return (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {test.name}
        </Typography>
      );
    }
  };
  const renderItems = () => {
    if (variant === "category") {
      const category = data as Category;
      return category.tests.map(test => (
        <Box
          key={test.id}
          sx={{
            backgroundColor: "#e0f7fa",
            p: 2,
            mb: 2,
            borderRadius: 1,
            border: "1px solid #4dd0e1",
          }}
        >
          <Typography variant="h6" sx={{ color: "#00838f" }}>
            {test.name}
          </Typography>
        </Box>
      ));
    } else {
      const test = data as Test;
      return (
        test.subtests?.map((subTest, index) => (
          <Box
            key={`${test.id}-subtest-${index}`}
            sx={{
              backgroundColor: "#e0f7fa",
              p: 2,
              mb: 2,
              borderRadius: 1,
              border: "1px solid #4dd0e1",
            }}
          >
            <Typography variant="h6" sx={{ color: "#00838f" }}>
              {subTest.name}
            </Typography>
          </Box>
        )) || null
      );
    }
  };

  const idField =
    variant === "category"
      ? `${fieldNamePrefix}[${index}].category_id`
      : `${fieldNamePrefix}[${index}].test_id`;

  const idValue = variant === "category" ? (data as Category).id : (data as Test).id;

  return (
    <Paper sx={{ padding: 2, mb: 2, borderRadius: 1 }}>
      {renderTitle()}

      <input type="hidden" {...control.register(idField)} defaultValue={idValue} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={4}>
          <SelectCtrl control={control} name={`${fieldNamePrefix}[${index}].summary_type`} label="Summary Type">
            {variant === "category"
              ? [
                  <MenuItem key="summary" value="summary">
                    Summary
                  </MenuItem>,
                  <MenuItem key="detail" value="detail">
                    Detail
                  </MenuItem>,
                ]
              : [
                  <MenuItem key="subtest" value="subtest">
                    Sub Test
                  </MenuItem>,
                  <MenuItem key="category" value="category">
                    Category
                  </MenuItem>,
                ]}
          </SelectCtrl>
        </Grid>
        <Grid size={4}>
          <SelectCtrl control={control} name={`${fieldNamePrefix}[${index}].summary_formula`} label="Summary Formula">
            <MenuItem value="avg">Average</MenuItem>
            <MenuItem value="sum">Sum</MenuItem>
          </SelectCtrl>
        </Grid>
        <Grid size={4}>
          <SelectCtrl control={control} name={`${fieldNamePrefix}[${index}].summary_view`} label="Summary View">
            <MenuItem value="table">Table</MenuItem>
            <MenuItem value="chart">Chart</MenuItem>
          </SelectCtrl>
        </Grid>
      </Grid>
      {renderItems()}
    </Paper>
  );
};
export default ReportCard;
