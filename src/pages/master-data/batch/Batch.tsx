import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useMemo, useState } from "react";
import useDialog from "@/hooks/useDialog.tsx";
import { Box, Button, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { TableSkeleton } from "@/components/Skeleton.tsx";
import DialogComp from "@/components/Dialog.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";

const Batch = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const getPermission = useAuthStore((state) => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: grouptest, refetch } = useFetch<{ data: any[] }>("/batch");
  const [selectedGroupTest, setSelectedGroupTest] = useState<{
    id: string;
    grouptest_name: string;
  } | null>(null);
  const {
    isOpen: isOpenDelete,
    open: openDelete,
    close: closeDelete,
  } = useDialog();

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "batch_name",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Code",
        accessorKey: "batch_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Group Test Code",
        accessorKey: "grouptest_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Total Assessee",
        accessorKey: "total_assessee",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Start Period",
        accessorKey: "start_period",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "End Period",
        accessorKey: "end_period",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Business Unit Code",
        accessorKey: "bu_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Function Menu Code",
        accessorKey: "fm_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableSorting: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const id = row.original.id;
          const grouptest_name = row.original.grouptest_name;
          return (
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/admin/batch/edit/${id}`)}
                aria-label="edit"
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleOpenDelete(id, grouptest_name)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: grouptest?.data ?? [],
    getRowId: (row) => row.id,
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: false,
    enableRowActions: false,
  });

  const handleOpenDelete = (id: string, grouptest_name: string) => {
    setSelectedGroupTest({ id, grouptest_name });
    openDelete();
  };

  const handleDelete = async (id: string) => {
    showLoading();
    try {
      const res = await API.delete(`/grouptest/${id}`); // Pastikan endpoint benar
      refetch();
      snack.success(res.data?.message);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Terjadi kesalahan");
      } else {
        snack.error("Error, check log for details");
      }
    } finally {
      closeDelete();
      hideLoading();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h2" component="div">
          Batch
          {getPermission("fcreate", 13) && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => navigate(`/admin/batch/create`)}
              sx={{ ml: 2 }}
            >
              Create Batch
            </Button>
          )}
        </Typography>
      </Box>

      {grouptest?.data?.length ? (
        getPermission("fread", 13) && <MaterialReactTable table={table} />
      ) : (
        <TableSkeleton column={4} row={2} small />
      )}

      <DialogComp
        title="Delete Group Test"
        open={isOpenDelete}
        onClose={closeDelete}
        actions={
          <>
            <Button onClick={closeDelete} variant="outlined" color="error">
              Cancel
            </Button>
            {selectedGroupTest && (
              <Button
                onClick={() => handleDelete(selectedGroupTest?.id)}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            )}
          </>
        }
      >
        {selectedGroupTest && (
          <Typography>{`Are you sure you want to delete ${selectedGroupTest.grouptest_name}?`}</Typography>
        )}
      </DialogComp>
    </Box>
  );
};

export default Batch;
