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
import React from "react";
import { Control } from "react-hook-form";
import SelectCtrl from "../forms/Select";
import { GrUpload, GrDownload, GrAdd } from "react-icons/gr";
import TextFieldCtrl from "../forms/TextField";

type AssignmentProps = {
  control: Control<any>;
};

const Assignment: React.FC<AssignmentProps> = ({ control }) => {
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
          <SelectCtrl
            name="assessee_nik"
            control={control}
            label="NIK"
            rules={{ required: "NIK is required" }}
          >
            <MenuItem value={1}>NIK 1</MenuItem>
            <MenuItem value={2}>NIK 2</MenuItem>
          </SelectCtrl>
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
					<Button variant="contained" startIcon={<GrAdd />}>
						Add
					</Button>
        </Box>
      </Stack>
    </>
  );
};
export default Assignment;
