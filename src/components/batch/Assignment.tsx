import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid2 as Grid,
  MenuItem,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo, useRef, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import { GrAdd, GrClose, GrDownload, GrUpload } from "react-icons/gr";
import { useParams } from "react-router-dom";
import SelectCtrl from "../forms/Select";
import TextFieldCtrl from "../forms/TextField";
import useDialog from "@/hooks/useDialog";
import DialogComp from "../Dialog";
import theme from "@/theme";

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
  const API = useAPI();
  const { id } = useParams();
  const { showLoading, hideLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const assesseeInputRef = useRef<HTMLInputElement | null>(null);
  const [assesseeData, setAssesseeData] = useState<any>(null);
  const [assessmentResults, setAssessmentResults] = useState<{
    valid_assessee: Assessee[];
    invalid_assessee: { assessee_nik: string; reason: string }[];
  } | null>(null);
  const { open, isOpen, close } = useDialog();
  const { setValue, getValues, setError, watch } = useFormContext();
  const assessees = watch("assessees") || [];
  const assignFor = watch("assign_for");
  const excelFile = watch("excel_file");

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

  const validAssesseeColumns = useMemo<MRT_ColumnDef<Assessee>[]>(
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

  const invalidAssesseeColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "assessee_nik",
        header: "NIK",
      },
      {
        accessorKey: "reason",
        header: "Reason",
      },
    ],
    []
  );

  const handleAddAssessee = () => {
    if (!assesseeData) return;

    // Buat ID unik untuk assessee baru
    const newId = `temp-${Date.now()}`;

    // Buat objek assessee baru
    const newAssessee: Assessee = {
      id: newId,
      assessee_nik: assesseeData.assessee_nik,
      assessee_name: assesseeData.assessee_name,
      assessee_email: assesseeData.assessee_email,
      fromDB: false,
    };

    // Periksa apakah assessee sudah ada dalam tabel
    const existingIndex = assessees.findIndex(
      (a: Assessee) => a.assessee_nik === newAssessee.assessee_nik
    );

    if (existingIndex >= 0) {
      snack.warning("Assessee dengan NIK ini sudah ada dalam daftar");
    } else {
      // Tambahkan assessee baru ke daftar
      const updatedAssessees = [...assessees, newAssessee];
      setValue("assessees", updatedAssessees);
      snack.success("Assessee berhasil ditambahkan");
    }

    // Reset form dan tutup popover
    setValue("assessee_nik", "");
    setAnchorEl(null);
    setAssesseeData(null);
    setIsPopoverOpen(false);
  };

  const handleAddAllValidAssessees = () => {
    if (!assessmentResults?.valid_assessee?.length) return;

    const newAssessees = [...assessees];
    let addedCount = 0;

    assessmentResults.valid_assessee.forEach(validAssessee => {
      // Periksa apakah assessee sudah ada dalam tabel
      const existingIndex = assessees.findIndex(
        (a: Assessee) => a.assessee_nik === validAssessee.assessee_nik
      );

      if (existingIndex < 0) {
        // Buat ID unik untuk assessee baru
        const newId = `temp-${Date.now()}-${validAssessee.assessee_nik}`;

        // Tambahkan assessee baru ke daftar
        newAssessees.push({
          id: newId,
          assessee_nik: validAssessee.assessee_nik,
          assessee_name: validAssessee.assessee_name,
          assessee_email: validAssessee.assessee_email,
          fromDB: false,
        });

        addedCount++;
      }
    });

    setValue("assessees", newAssessees);
    close();
    setValue("excel_file", null);
    setAssessmentResults(null);

    if (addedCount > 0) {
      snack.success(`Berhasil menambahkan ${addedCount} assessee`);
    } else {
      snack.warning("Semua assessee sudah ada dalam daftar");
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setAssesseeData(null);
    setIsPopoverOpen(false);
  };

  const handleVerifyAssessee = async () => {
    const assessee_nik = getValues("assessee_nik");
    setLoading(true);
    if (!assessee_nik) {
      setError("assessee_nik", { type: "manual", message: "NIK is required" });
      setLoading(false);
      return;
    }
    try {
      const response = await API.post(`batch/darwin-assessee`, {
        assessee_nik,
      });
      const data = response.data.data;

      if (data.valid_assessee && data.valid_assessee.length > 0) {
        setAssesseeData(data.valid_assessee[0]);
        setAnchorEl(assesseeInputRef.current);
        setIsPopoverOpen(true);
      } else {
        snack.error("NIK not valid or not found");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Terjadi kesalahan");
      } else {
        snack.error("Error, check log for details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExcel = async () => {
    if (!excelFile) {
      snack.error("Please upload an excel file first");
      return;
    }
    // setLoading(true)
    showLoading();
    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      const res = await API.post(`batch/darwin-assessee`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data.data;

      setAssessmentResults({
        valid_assessee: data.valid_assessee || [],
        invalid_assessee: data.invalid_assessee || [],
      });

      open();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Terjadi kesalahan");
      } else {
        snack.error("Error, check log for details");
      }
    } finally {
      // setLoading(false);
      hideLoading();
    }
  };

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

  const validAssesseeTable = useMaterialReactTable({
    columns: validAssesseeColumns,
    data: assessmentResults?.valid_assessee || [],
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme => theme.palette.success.main,
        color: "white",
      },
    },
  });

  const invalidAssesseeTable = useMaterialReactTable({
    columns: invalidAssesseeColumns,
    data: assessmentResults?.invalid_assessee || [],
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme => theme.palette.primary.main,
        color: "white",
      },
    },
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 4 }}>
          <SelectCtrl
            name="assign_for"
            control={control}
            label="Assign For"
            defaultValue="internal"
          >
            <MenuItem value="internal">Internal</MenuItem>
            <MenuItem value="external">External</MenuItem>
          </SelectCtrl>
        </Grid>
        <Grid size={{ xs: 4 }}>
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
        <Grid size={{ xs: 4 }}>
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
      {assignFor === "internal" ? (
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography color="textSecondary" fontWeight={600}>
              Input Excel:{" "}
            </Typography>
            <>
              {!excelFile ? (
                <>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="excel-upload"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("excel_file", file);
                      }
                    }}
                  />
                  <label htmlFor="excel-upload">
                    <Button component="span" variant="contained" startIcon={<GrUpload />}>
                      Upload Excel
                    </Button>
                  </label>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={excelFile.name}
                    onDelete={() => setValue("excel_file", null)}
                    deleteIcon={<GrClose />}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    loading={loading}
                    onClick={handleProcessExcel}
                  >
                    Process
                  </Button>
                </Box>
              )}
            </>
            {/* <Button variant="outlined" startIcon={<GrDownload />}>
              Download Template
            </Button> */}
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
              inputRef={assesseeInputRef}
            />
            <Button
              variant="contained"
              startIcon={<GrAdd />}
              onClick={handleVerifyAssessee}
              loadingPosition="start"
              loading={loading}
            >
              Verify
            </Button>
          </Box>
          <Popover
            open={isPopoverOpen}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Box sx={{ p: 2, maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Assessee Data
              </Typography>
              {assesseeData && (
                <Stack spacing={1}>
                  <Typography>
                    <strong>NIK:</strong> {assesseeData.assessee_nik}
                  </Typography>
                  <Typography>
                    <strong>Name:</strong> {assesseeData.assessee_name}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {assesseeData.assessee_email}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={handleClosePopover}>
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleAddAssessee}>
                      Add
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Popover>
        </Stack>
      ) : (
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
        </Stack>
      )}
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
      <DialogComp
        title="Add New Assesses"
        open={isOpen}
        onClose={close}
        maxWidth="md"
        actions={
          <>
            <Button variant="outlined" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddAllValidAssessees}
              disabled={!assessmentResults?.valid_assessee?.length}
            >
              Add Valid Assesses
            </Button>
          </>
        }
      >
        <Box sx={{ p: 2 }}>
          {/* Bagian Valid Assesses */}
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.success.main,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Valid Assesses
          </Typography>
          <Box sx={{ mb: 4 }}>
            {assessmentResults?.valid_assessee && assessmentResults.valid_assessee.length > 0 ? (
              <MaterialReactTable table={validAssesseeTable} />
            ) : (
              <Typography>No valid assesses found</Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Bagian Invalid Assesses */}
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              mb: 1,
            }}
          >
            Invalid Assesses
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Please recheck the NIK
          </Typography>
          <Box sx={{ mb: 4 }}>
            {assessmentResults?.invalid_assessee &&
            assessmentResults.invalid_assessee.length > 0 ? (
              <MaterialReactTable table={invalidAssesseeTable} />
            ) : (
              <Typography>No invalid assesses found</Typography>
            )}
          </Box>
        </Box>
      </DialogComp>
    </>
  );
};
export default Assignment;
