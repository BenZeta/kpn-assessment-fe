import React, { useState, useEffect, useRef, useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
import { Box, Divider, Grid2 as Grid, MenuItem, Typography } from "@mui/material";
import TextFieldCtrl from "../forms/TextField";
import TimePickerCtrl from "../forms/TimePicker";
import useFetch from "@/hooks/useFetch";
import SelectCtrl from "../forms/Select";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";

type SubtestProps = {
  control: Control<any>;
};

const Subtest: React.FC<SubtestProps> = ({ control }) => {
  const { setValue, watch } = useFormContext();
  const selectedSeries = watch("series") || [];
  const [rowSelection, setRowSelection] = useState({});
  const isInitialMount = useRef(true);
  const isUpdatingForm = useRef(false);

  const { data: criteria } = useFetch<any>("/criteria");
  const { data: allSeries } = useFetch<any>("/series");

  useEffect(() => {
    if (isInitialMount.current && allSeries?.data) {
      const initialSelection: Record<string, boolean> = {};

      selectedSeries.forEach((item: any) => {
        if (item.series_id) {
          initialSelection[item.series_id] = true;
        }
      });

      if (Object.keys(initialSelection).length > 0) {
        setRowSelection(initialSelection);
      }

      isInitialMount.current = false;
    }
  }, [selectedSeries, allSeries]);

  useEffect(() => {
    // Skip if we're in the initialization phase
    if (isInitialMount.current || isUpdatingForm.current || !allSeries?.data) {
      return;
    }

    const selectedIds = Object.keys(rowSelection).filter(
      id => rowSelection[id as keyof typeof rowSelection]
    );

    const selectedSeriesData = selectedIds.map(id => ({ series_id: id }));

    isUpdatingForm.current = true;

    // Update the form
    setValue("series", selectedSeriesData, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setTimeout(() => {
      isUpdatingForm.current = false;
    }, 0);
  }, [rowSelection, setValue, allSeries]);


  // Log for debugging
  useEffect(() => {
    console.log("Current series in form:", selectedSeries);
    console.log("Current rowSelection:", rowSelection);
  }, [selectedSeries, rowSelection]);

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "series_name",
        header: "Title",
      },
      {
        accessorKey: "question_count",
        header: "Total Question",
      },
      {
        accessorKey: "created_by",
        header: "Created By",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: allSeries?.data ?? [],
    getRowId: row => row.id,
    enablePagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection: rowSelection,
    },
    initialState: {
      density: "compact",
    },
  });

  return (
    <>
      <Box sx={{ mb: 4, px: 6 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Subtest Information
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This page is used to enter the subtest information. Please fill in the title, code,
          duration, criteria and choose the relevant series.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} sx={{ px: 6 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextFieldCtrl
            control={control}
            name="subtest_name"
            label="Title"
            placeholder="Enter Subtest Title here ..."
            rules={{ required: "This field is required" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextFieldCtrl
            control={control}
            name="subtest_code"
            label="Code"
            placeholder="Enter Subtest Code here ..."
            rules={{ required: "This field is required" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TimePickerCtrl
            control={control}
            name="subtest_duration"
            label="Duration (hh:mm:ss)"
            format="HH:mm:ss"
            views={["hours", "minutes", "seconds"]}
            ampm={false}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <SelectCtrl name="criteria_id" control={control} label="Criteria">
            {criteria?.data.map((item: any) => (
              <MenuItem key={item.value_id} value={item.value_id}>
                {item.value_name} ({item.value_code})
              </MenuItem>
            ))}
          </SelectCtrl>
        </Grid>
      </Grid>
      <Box sx={{ px: 6, mt: 2 }}>
        <MaterialReactTable table={table} />
      </Box>
    </>
  );
};
export default Subtest;
