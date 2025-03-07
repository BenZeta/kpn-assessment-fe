import {
  Grid2 as Grid,
  TextField,
  Typography,
  Box,
  Button,
  Autocomplete,
} from "@mui/material";
<<<<<<<< HEAD:src/pages/master-data/CreateSeries.tsx
========
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
>>>>>>>> 14c6b60 (Update batch navigation and clean up unused imports in BatchCreateEdit component):src/pages/master-data/series/CreateSeries.tsx
import React, { useMemo, useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

export type Question = {
  id: string;
  nama: string;
  code: string;
};

const CreateSeries: React.FC = () => {
  const data = [
    {
      id: "1",
      nama: "Question 1",
      code: "Q1",
    },
    {
      id: "2",
      nama: "Question 2",
      code: "Q2",
    },
    {
      id: "3",
      nama: "Question 3",
      code: "Q3",
    },
  ];

  const {
    refineCore: { onFinish, formLoading, query },
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm();

<<<<<<<< HEAD:src/pages/master-data/CreateSeries.tsx
  const [selectedRows, setSelectedRows] = useState<Question[]>([]);
========
  const navigate = useNavigate();
  const API = useAPI();
  const user_id = useAuthStore((state) => state.user_id);
  const getPermission = useAuthStore((state) => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const [selectedQuestion, setSelectedQuestion] = useState();
  const { data: categories } = useFetch<any>("/category");
  const { data: question } = useFetch<any>("/question");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const handleCategoryChange = (_: any, value: any) => {
    setValue("category_id", value?.id || null);
  };
>>>>>>>> 14c6b60 (Update batch navigation and clean up unused imports in BatchCreateEdit component):src/pages/master-data/series/CreateSeries.tsx

  const columns = useMemo<MRT_ColumnDef<Question>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Nama",
        accessorKey: "nama",
      },
      {
        header: "Code",
        accessorKey: "code",
      },
    ],
    []
  );
  return (
<<<<<<<< HEAD:src/pages/master-data/CreateSeries.tsx
    <>
      <Typography variant="h1" color="primary">
        Create a New Series
      </Typography>
      <form onSubmit={handleSubmit(onFinish)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...(register("seriesName"), { required: true })}
              fullWidth
              variant="outlined"
              placeholder="Input series name here"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...(register("seriesCode"), { required: true })}
              fullWidth
              variant="outlined"
              placeholder="Input series code here"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={data}
              getOptionLabel={(option) => option.nama}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Question"
                  variant="outlined"
                />
              )}
            />
          </Grid>
========
    <Create
      title={
        <Typography variant="h6" fontWeight="600">
          Create a New Series
        </Typography>
      }
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
>>>>>>>> 14c6b60 (Update batch navigation and clean up unused imports in BatchCreateEdit component):src/pages/master-data/series/CreateSeries.tsx
        </Grid>
        <Box>
          <MaterialReactTable
            columns={columns}
            data={data}
            enableRowSelection
            onRowSelectionChange={(selected) => {
              const selectedQuestions = Object.keys(selected).map(
                (id) => data.find((question) => question.id === id)!
              );
              setSelectedRows(selectedQuestions);
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" color="primary" type="submit">
            Submit Series
          </Button>
        </Box>
      </form>
    </>
  );
};
export default CreateSeries;
