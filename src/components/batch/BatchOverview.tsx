import { Box, Grid2 as Grid } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";
import TextFieldCtrl from "../forms/TextField";

type BatchOverviewProps = {
  control: Control<any>;
};

const BatchOverview: React.FC<BatchOverviewProps> = ({ control }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextFieldCtrl
            control={control}
            label="Batch Name"
            name="batch_name"
            rules={{
              required: "Batch Name is required",
              maxLength: { value: 128, message: "Max 128 characters allowed" },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldCtrl
            control={control}
            label="Description"
            name="description"
            rules={{ required: "Description is required" }}
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default BatchOverview;
