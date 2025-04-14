import React, { useState, useEffect, useRef, useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
import { Box, Divider, Typography, Stack } from "@mui/material";
import TextFieldCtrl from "../forms/TextField";
import useFetch from "@/hooks/useFetch";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";

type IntroductionProps = {
  control: Control<any>;
};

const Introduction: React.FC<IntroductionProps> = ({ control }) => {
  const { setValue, watch } = useFormContext();
  const series_example_id = watch("series_example_id") || "";
  const isInitialMount = useRef(true);
  const isUpdatingForm = useRef(false);

  const { data: allSeries } = useFetch<any>("/series");

  // Set row selection state berdasarkan series_example_id
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Inisialisasi rowSelection berdasarkan nilai series_example_id yang ada
  useEffect(() => {
    if (isInitialMount.current && allSeries?.data) {
      const initialSelection: Record<string, boolean> = {};
      initialSelection[series_example_id] = true;

      if (Object.keys(initialSelection).length > 0) {
        setRowSelection(initialSelection);
      }

      isInitialMount.current = false;
    }
  }, [series_example_id, allSeries]);

  useEffect(() => {
    if (isInitialMount.current || isUpdatingForm.current || !allSeries?.data) {
      return;
    }

    const selectedIds = Object.keys(rowSelection).filter(
      id => rowSelection[id as keyof typeof rowSelection]
    );

    // Karena hanya satu yang dipilih, ambil yang pertama (dan satu-satunya)
    const selectedId = selectedIds.length > 0 ? selectedIds[0] : "";

    isUpdatingForm.current = true;

    setValue("series_example_id", selectedId, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setTimeout(() => {
      isUpdatingForm.current = false;
    }, 0);
  }, [rowSelection, setValue, allSeries]);

  // Log untuk debugging
  useEffect(() => {
    console.log("Current series_example_id in form:", series_example_id);
    console.log("Current rowSelection:", rowSelection);
  }, [series_example_id, rowSelection]);


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
    enableMultiRowSelection: false, // Penting: hanya izinkan single selection
  });

  return (
    <>
      <Box sx={{ mb: 4, px: 6 }}>
        <Typography variant="h6" color="textSecondary" fontWeight={600}>
          Introduction to the Subtest
        </Typography>
        <Typography variant="body1" color="textSecondary">
          The introduction page is intended to provide instructions for working on problems from the
          given subtest. So write the description as clearly as possible and add the appropriate
          example series.
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2} sx={{ px: 6 }}>
        <TextFieldCtrl
          control={control}
          label="Introduction Description"
          name="intro_desc"
          rules={{ required: "Introduction Description is required" }}
          multiline
          rows={4}
          placeholder="Enter introduction description here..."
        />
        <Box>
          <Typography variant="h6" color="textSecondary" fontWeight={600}>
            Series
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Choose an introduction series for the Subtest
          </Typography>
        </Box>
        <MaterialReactTable table={table} />
      </Stack>
    </>
  );
};

export default Introduction;
