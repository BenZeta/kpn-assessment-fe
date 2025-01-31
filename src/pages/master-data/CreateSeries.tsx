import {
  Grid2 as Grid,
  TextField,
  Typography,
  Box,
  Button,
  Autocomplete,
} from "@mui/material";
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

  const [selectedRows, setSelectedRows] = useState<Question[]>([]);

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
