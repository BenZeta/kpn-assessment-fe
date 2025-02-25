import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";
import DatePickerCtrl from "../forms/DatePicker.tsx";
import TimePickerCtrl from "../forms/TimePicker.tsx";
import dayjs from "dayjs";

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
              rules={{ required: "Start Date is required" }}
            />
          </Grid>
          {/* <Divider /> */}
          <Grid size={{ xs: 6 }}>
            <DatePickerCtrl
              name="end_date"
              label="End Date"
              control={control}
              rules={{
                required: "End Date is required",
                validate: (value, formValues) => {
                  if (!formValues.start_date || !value) return true;
                  return (
                    dayjs(value).isAfter(dayjs(formValues.start_date)) ||
                    dayjs(value).isSame(dayjs(formValues.start_date), 'day') ||
                    "End Date must be after Start Date"
                  );
                },
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TimePickerCtrl
              name="start_time"
              label="Start Time"
              control={control}
              rules={{ required: "Start Time is required" }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TimePickerCtrl
              name="end_time"
              label="End Time"
              control={control}
              rules={{ required: "End Time is required", validate: (value, formValues) => {
                if (
                  !formValues.start_date ||
                  !formValues.end_date ||
                  !formValues.start_time ||
                  !value
                )
                  return true;
                if (
                  dayjs(formValues.start_date).isSame(
                    dayjs(formValues.end_date),
                    "day"
                  )
                ) {
                  return (
                    dayjs(value).isAfter(dayjs(formValues.start_time)) ||
                    "End time must be after start time on the same day"
                  );
                }
                return true;
              }}}
            />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
export default AssignmentTime;
