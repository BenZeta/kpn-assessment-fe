import TextFieldCtrl from "@/components/forms/TextField";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { SeriesValues } from "@/types/MasterData";
import { ArrowBack, Visibility } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSeries: React.FC = () => {
  const {
    refineCore: { formLoading },
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      series_name: "",
      series_code: "",
      category_id: "",
      question_id: [],
      detail: [],
    },
  });
  const navigate = useNavigate();
  const API = useAPI();
  const user_id = useAuthStore((state) => state.user_id);
  const getPermission = useAuthStore((state) => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: categories } = useFetch<any>("/category");
  const { data: question } = useFetch<any>("/question");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const handleCategoryChange = (_: any, value: any) => {
    setValue("category_id", value?.id || null);
  };

  const category_id = watch("category_id");

  const filteredQuestions = useMemo(() => {
    if (!category_id) return [];
    return (
      question?.data.filter((q: any) => q.category_id === category_id) || []
    );
  }, [category_id, question]);

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Question",
        accessorKey: "q_input_text",
      },
      {
        header: "Code",
        accessorKey: "question_code",
      },
      {
        header: "Created By",
        accessorKey: "created_by",
      },
      {
        header: "Created At",
        accessorKey: "created_at",
      },
      {
        id: "actions",
        header: "Actions",
        enableColumnActions: false,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        Cell: ({ row }) => (
          <IconButton
            onClick={() => alert(JSON.stringify(row.original, null, 2))}
          >
            <Visibility />
          </IconButton>
        ),
      },
    ],
    []
  );

  const onSubmit = async (data: SeriesValues) => {
    try {
      showLoading();
      const payload = {
        series_name: data.series_name,
        series_code: data.series_code,
        category_id: data.category_id,
        created_by: user_id,
        detail: Object.keys(rowSelection).map((id) => ({
          question_id: id,
        })),
        is_active: true,
      };

      console.log("Ini Payload: ", JSON.stringify(payload, null, 2));

      const response = await API.post("/series", payload);
      console.log(response);
      reset();
      setRowSelection({});
    } catch (error) {
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredQuestions,
    getRowId: (row) => row.id, // Pastikan row menggunakan ID yang unik
    state: {
      rowSelection, // Sync state selection dengan tabel
    },
    onRowSelectionChange: setRowSelection, // Update state saat selection berubah
    // isLoading,
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
  });

  return (
    <Create
      title={<Typography variant="h6"> Create a New Series</Typography>}
      isLoading={formLoading}
      saveButtonProps={{
        onClick: handleSubmit(onSubmit),
        disabled: isSubmitting,
      }}
      goBack={
        <IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextFieldCtrl
            control={control}
            name="series_name"
            label="Series Name"
            rules={{ required: true }}
            placeholder="Input series name here"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextFieldCtrl
            control={control}
            name="series_code"
            label="Series Code"
            rules={{ required: true }}
            placeholder="Input series code here"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={categories?.data || []}
            getOptionLabel={(option) => option.category_name || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={handleCategoryChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Category"
                variant="outlined"
              />
            )}
          />
        </Grid>
      </Grid>
      <Box mt={2}>
        <MaterialReactTable table={table} />
      </Box>
    </Create>
  );
};
export default CreateSeries;
