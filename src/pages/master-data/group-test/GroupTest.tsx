import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import DialogComp from "@/components/Dialog.tsx";
import { TableSkeleton } from "@/components/Skeleton.tsx";
import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import useDialog from "@/hooks/useDialog.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import theme from "@/theme";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import moment from "moment/moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GroupTest = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: grouptest, refetch, loading } = useFetch<{ data: any[] }>("/grouptest");
  const [selectedGroupTest, setSelectedGroupTest] = useState<{
    id: string;
    grouptest_name: string;
  } | null>(null);
  const { isOpen: isOpenDelete, open: openDelete, close: closeDelete } = useDialog();

  const columns: CustomTableColumn<any>[] = [
    {
      header: "Name",
      accessorKey: "grouptest_name",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Code",
      accessorKey: "grouptest_code",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Total Test",
      accessorKey: "test_count",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Status",
      accessorKey: "is_active",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      Cell: ({ cell }: any) => (cell.getValue() ? "Active" : "Inactive"),
    },
    {
      header: "Created By",
      accessorKey: "created_by",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? moment(value).format("MMMM DD, YYYY hh:mm A") : "";
      },
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            {getPermission("fupdate", 5) && (
              <Tooltip title="Edit Group Test" placement="top" arrow>
                <IconButton
                  onClick={() => navigate(`/admin/grouptest/edit/${id}`)}
                  aria-label="edit"
                  size="small"
                >
                  <EditIcon sx={{ color: "secondary.dark" }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details" placement="top" arrow>
              <IconButton
                onClick={() => navigate(`/admin/grouptest/detail/${id}`)}
                aria-label="edit"
                size="small"
              >
                <InfoIcon sx={{ color: "info.light" }} />
              </IconButton>
            </Tooltip>
            {getPermission("fdelete", 6) && (
              <Tooltip title="Delete Group Test" placement="top" arrow>
                <IconButton color="primary" onClick={() => handleOpenDelete(id, grouptest_name)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

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
    <Box
      sx={{
        p: 3,
        height: "100%",
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h1" color="primary">
          Group Test
        </Typography>
        {getPermission("fcreate", 3) && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => navigate(`/admin/grouptest/create`)}
            sx={{ ml: 2 }}
          >
            Create Group Test
          </Button>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {loading ? (
          <TableSkeleton column={4} row={2} small />
        ) : (
          <CustomTable
            columns={columns}
            data={grouptest?.data || []}
            hasPermission={getPermission("fread", 13)}
            isLoading={!grouptest}
            enableFilters={true}
          />
        )}
      </Box>
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

export default GroupTest;
