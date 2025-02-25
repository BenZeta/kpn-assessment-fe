import {
  Box,
  Button,
  Divider,
  Grid2 as Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import { GrAdd, GrDownload, GrUpload } from "react-icons/gr";
import SelectCtrl from "../forms/Select";
import TextFieldCtrl from "../forms/TextField";

type Assessee = {
  id: string;
  nik: string;
  name: string;
  email: string;
};

type AssignmentProps = {
  control: Control<any>;
};

const Assignment: React.FC<AssignmentProps> = ({ control }) => {
  const { setValue, getValues, setError, clearErrors, watch } =
    useFormContext();
  const assessees = watch("assessees") || [];
  // const [assessees, setAssessees] = useState<Assessee[]>([]);

  const [tableKey, setTableKey] = useState(0);

  const columns = useMemo<MRT_ColumnDef<Assessee>[]>(
    () => [
      {
        accessorKey: "nik",
        header: "NIK",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
    ],
    []
  );

  useEffect(() => {
    setValue(
      "assessee_nik",
      assessees.map((a: Assessee) => a.nik)
    );
    setValue(
      "assessee_name",
      assessees.map((a: Assessee) => a.name)
    );
    setValue(
      "assessee_email",
      assessees.map((a: Assessee) => a.email)
    );

    // Check if we have assessees
    if (assessees.length > 0) {
      clearErrors(["assessee_nik", "assessee_name", "assessee_email"]);
    }

    // Force table re-render
    setTableKey((prev) => prev + 1);
  }, [assessees, setValue, clearErrors]);

  const handleAddAssessee = () => {
    const nik = getValues("assessee_nik");
    const name = getValues("assessee_name");
    const email = getValues("assessee_email");

    // Validate fields
    let hasError = false;

    if (!nik) {
      setError("assessee_nik", { type: "manual", message: "NIK is required" });
      hasError = true;
    }

    if (!name) {
      setError("assessee_name", {
        type: "manual",
        message: "Name is required",
      });
      hasError = true;
    }

    if (!email) {
      setError("assessee_email", {
        type: "manual",
        message: "Email is required",
      });
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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
      nik,
      name,
      email,
    };

    // Update assessees array
    // setAssessees((prev) => [...prev, newAssessee]);
    setValue("assessees", [...assessees, newAssessee]);

    // Clear input fields
    setValue("assessee_nik", "");
    setValue("assessee_name", "");
    setValue("assessee_email", "");
  };

  const table = useMaterialReactTable({
    columns,
    data: assessees,
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: (row) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          color="error"
          onClick={() => {
            const updatedAssessees: Assessee[] = assessees.filter(
              (assessee: Assessee) => assessee.id !== row.row.original.id
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
            name="function_id"
            control={control}
            label="Function"
            rules={{ required: "Function is required" }}
          >
            <MenuItem value={1}>Function 1</MenuItem>
            <MenuItem value={2}>Function 2</MenuItem>
          </SelectCtrl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <SelectCtrl
            name="bu_id"
            control={control}
            label="Business Unit"
            rules={{ required: "Business Unit is required" }}
          >
            <MenuItem value={1}>Business Unit 1</MenuItem>
            <MenuItem value={2}>Business Unit 2</MenuItem>
          </SelectCtrl>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="h6"
        color="textSecondary"
        fontWeight={600}
        gutterBottom
      >
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
          {/* <SelectCtrl
            name="assessee_nik"
            control={control}
            label="NIK"
            rules={{ required: "NIK is required" }}
          >
            <MenuItem value={1}>NIK 1</MenuItem>
            <MenuItem value={2}>NIK 2</MenuItem>
          </SelectCtrl> */}
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
          <Button
            variant="contained"
            startIcon={<GrAdd />}
            onClick={handleAddAssessee}
          >
            Add
          </Button>
        </Box>
      </Stack>
      <Box sx={{ mt: 3 }}>
        <Typography color="textSecondary" fontWeight={600} gutterBottom>
          Assessee List
        </Typography>
        {assessees.length > 0 ? (
          <Box key={tableKey}>
            <MaterialReactTable table={table} />
          </Box>
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
