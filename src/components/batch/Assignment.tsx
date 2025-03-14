import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { API } from "@/utils/api";
import { Box, Button, Divider, Grid2 as Grid, MenuItem, Stack, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo } from "react";
import { Control, useFormContext } from "react-hook-form";
import { GrAdd, GrDownload, GrUpload } from "react-icons/gr";
import { useParams } from "react-router-dom";
import SelectCtrl from "../forms/Select";
import TextFieldCtrl from "../forms/TextField";

type Assessee = {
  id: string;
  assessee_nik: string;
  assessee_name: string;
  assessee_email: string;
  fromDB?: boolean;
};

type AssignmentProps = {
  control: Control<any>;
};

const Assignment: React.FC<AssignmentProps> = ({ control }) => {
  const { id } = useParams();
  const { showLoading, hideLoading } = useLoading();
  const { setValue, getValues, setError, watch } = useFormContext();
  const assessees = watch("assessees") || [];

  const { data: BusinessUnit } = useFetch<any>("/bu");
  const { data: FunctionMenu } = useFetch<any>("/function-menu");

  const columns = useMemo<MRT_ColumnDef<Assessee>[]>(
    () => [
      {
        accessorKey: "assessee_nik",
        header: "NIK",
      },
      {
        accessorKey: "assessee_name",
        header: "Name",
      },
      {
        accessorKey: "assessee_email",
        header: "Email",
      },
    ],
    []
  );

  const handleAddAssessee = () => {
    const assessee_nik = getValues("assessee_nik");
    const assessee_name = getValues("assessee_name");
    const assessee_email = getValues("assessee_email");

    // Validate fields
    let hasError = false;

    if (!assessee_nik) {
      setError("assessee_nik", { type: "manual", message: "NIK is required" });
      hasError = true;
    }

    if (!assessee_name) {
      setError("assessee_name", {
        type: "manual",
        message: "Name is required",
      });
      hasError = true;
    }

    if (!assessee_email) {
      setError("assessee_email", {
        type: "manual",
        message: "Email is required",
      });
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(assessee_email)) {
      setError("assessee_email", {
        type: "manual",
        message: "Invalid email format",
      });
      hasError = true;
    }

    if (hasError) return;

    // Add new assessee to the table
    const newAssessee: Assessee = {
      id: Date.now().toString(), // Unique ID
      assessee_nik,
      assessee_name,
      assessee_email,
    };

    setValue("assessees", [...assessees, newAssessee]);

    // Clear input fields
    setValue("assessee_nik", "");
    setValue("assessee_name", "");
    setValue("assessee_email", "");
  };

  // TODO : Implement delete assessee
  const handleDeleteAseessee = async (assessee_id: string) => {
    showLoading();
    try {
      const res = await API.delete(`batch/${id}/assessee/${assessee_id}`);
      console.log(res.data.message);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Terjadi kesalahan");
      } else {
        snack.error("Error, check log for details");
      }
    } finally {
      hideLoading();
    }
  };

  const handleFunctionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const functionId = event.target.value as string;
    const selectedFunction = FunctionMenu?.data.find((func: any) => func.id === functionId);

    if (selectedFunction) {
      setValue("function_id", functionId);
      setValue("fm_name", selectedFunction.fm_name);
    }
  };

  const handleBusinessUnitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const buId = event.target.value as string;
    const selectedBU = BusinessUnit?.data.find((bu: any) => bu.id === buId);

    if (selectedBU) {
      setValue("bu_id", buId);
      setValue("bu_name", selectedBU.bu_name);
    }
  };



  const table = useMaterialReactTable({
    columns,
    data: assessees,
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: row => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          color="error"
          onClick={async () => {
            const assessee = row.row.original;
            if (assessee.fromDB) {
              // Data berasal dari database, panggil API delete
              await handleDeleteAseessee(assessee.id);
            }
            // Update state dengan menghilangkan assessee tersebut dari daftar
            const updatedAssessees: Assessee[] = assessees.filter(
              (a: Assessee) => a.id !== assessee.id
            );
            setValue("assessees", updatedAssessees);
          }}
          variant="contained"
          size="small"
        >
          Delete
        </Button>
      </Box>
    ),
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <SelectCtrl
            name="fm_id"
            control={control}
            label="Function"
            rules={{ required: "Function is required" }}
            onChangeOvr={handleFunctionChange}
          >
            {FunctionMenu?.data.map((func: any) => (
              <MenuItem key={func.id} value={func.id}>
                {func.fm_name}
              </MenuItem>
            ))}
          </SelectCtrl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <SelectCtrl
            name="bu_id"
            control={control}
            label="Business Unit"
            rules={{ required: "Business Unit is required" }}
            onChangeOvr={handleBusinessUnitChange}
          >
            {BusinessUnit?.data.map((bu: any) => (
              <MenuItem key={bu.id} value={bu.id}>
                {bu.bu_name}
              </MenuItem>
            ))}
          </SelectCtrl>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" color="textSecondary" fontWeight={600} gutterBottom>
        Assessee
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography color="textSecondary" fontWeight={600}>
            Input Exel:{" "}
          </Typography>
          <Button variant="contained" startIcon={<GrUpload />}>
            Upload Exel
          </Button>
          <Button variant="outlined" startIcon={<GrDownload />}>
            Download Template
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography color="textSecondary" fontWeight={600}>
            Input Manual:{" "}
          </Typography>
          <TextFieldCtrl
            name="assessee_nik"
            control={control}
            label="NIK"
            placeholder="Type NIK here ..."
            rules={{ required: "NIK is required" }}
          />
          <TextFieldCtrl
            name="assessee_name"
            control={control}
            label="Name"
            placeholder="Type name here ..."
            rules={{ required: "Name is required" }}
          />
          <TextFieldCtrl
            name="assessee_email"
            control={control}
            label="Email"
            placeholder="Type email here ..."
            rules={{ required: "Email is required" }}
          />
          <Button variant="contained" startIcon={<GrAdd />} onClick={handleAddAssessee}>
            Add
          </Button>
        </Box>
      </Stack>
      <Box sx={{ mt: 3 }}>
        <Typography color="textSecondary" fontWeight={600} gutterBottom>
          Assessee List
        </Typography>
        {assessees.length > 0 ? (
          <MaterialReactTable table={table} />
        ) : (
          <Typography color="textSecondary">
            No assessee added yet. Please add assessees using the form above.
          </Typography>
        )}
      </Box>
    </>
  );
};
export default Assignment;
