import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";
import DatePickerCtrl from "../forms/DatePicker.tsx";
import TimePickerCtrl from "../forms/TimePicker.tsx";

type AssignmentTimeProps = {
  control: Control<any>;
};

const AssignmentTime: React.FC<AssignmentTimeProps> = ({ control }) => {
  return (
    <>
      <Typography variant="h5" fontWeight={600}>
        Assignment Time
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Assignment Time includes date and time configuration for batch
        assignment.
      </Typography>
      <Stack spacing={2} mt={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <DatePickerCtrl
              name="start_date"
              label="Start Date"
              control={control}
            />
          </Grid>
          {/* <Divider /> */}
          <Grid size={{ xs: 6 }}>
            <DatePickerCtrl
              name="end_date"
              label="End Date"
              control={control}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TimePickerCtrl
              name="start_time"
              label="Start Time"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TimePickerCtrl
              name="end_time"
              label="End Time"
              control={control}
            />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
export default AssignmentTime;
