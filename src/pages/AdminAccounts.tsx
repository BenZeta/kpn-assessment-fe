import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { TableSkeleton } from "@/components/Skeleton";
import useAuthStore from "@/hooks/useAuthStore";
import useFetch from "@/hooks/useFetch";
import theme from "@/theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeletIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useDialog from "@/hooks/useDialog";
import DialogComp from "@/components/Dialog";
import { useLoading } from "@/providers/LoadingProvider";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useState } from "react";

const AdminAccounts = () => {
  const navigate = useNavigate();
  const getPermission = useAuthStore(state => state.getPermission);
  const { data: admin, loading, refetch } = useFetch<any>("/admin");
  const API = useAPI();

  const { open, isOpen, close } = useDialog();
  const { showLoading, hideLoading } = useLoading();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const columns: CustomTableColumn<any>[] = [
    {
      header: "Username",
      accessorKey: "username",
      muiTableHeadCellProps: { align: "left" },
    },
    {
      header: "Full Name",
      accessorKey: "fullname",
      muiTableHeadCellProps: { align: "left" },
    },
    {
      header: "Email",
      accessorKey: "email",
      muiTableHeadCellProps: { align: "left" },
    },
    {
      header: "Active",
      accessorKey: "is_active",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      renderChip: value => ({
        label: value ? "Yes" : "No",
        color: value ? "success" : "error",
        variant: "outlined",
      }),
    },
    {
      header: "Role",
      accessorKey: "role_name",
      muiTableHeadCellProps: { align: "left" },
    },
    {
      header: "Actions",
      accessorKey: "id",
      enableSorting: false,
      enableColumnFilter: false,
      muiTableHeadCellProps: { align: "center" },
      Cell: ({ row }) => {
        const id = row.original.id;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            {getPermission("fupdate", 5) && (
              <Tooltip title="Edit Admin" placement="top" arrow>
                <IconButton onClick={() => navigate(`/admin/accounts/edit/${id}`)} size="small">
                  <EditIcon sx={{ color: "secondary.dark" }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details" placement="top" arrow>
              <IconButton onClick={() => navigate(`/admin/accounts/${id}`)} size="small">
                <InfoIcon sx={{ color: "info.light" }} />
              </IconButton>
            </Tooltip>
            {getPermission("fdelete", 8) && (
              <Tooltip title="Delete Admin" placement="top" arrow>
                <IconButton onClick={() => handleOpenDeleteDialog(id)} size="small">
                  <DeletIcon sx={{ color: "error.main" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];
  const handleOpenDeleteDialog = (id: string) => {
    open();
    setSelectedAccountId(id);
  };

  const handleDelete = async (id: string) => {
    showLoading();
    try {
      await API.delete(`/admin/${id}`);
      snack.success("Admin account deleted successfully.");
      refetch();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
      close();
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
        <Typography variant="h2" color="primary" mb={0}>
          Admin Accounts
        </Typography>
        {getPermission("fcreate", 1) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/accounts/create")}
          >
            New Admin
          </Button>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {loading ? (
          <TableSkeleton column={4} row={2} small />
        ) : (
          <CustomTable columns={columns} data={admin.data} enableFilters={true} />
        )}
      </Box>

      <DialogComp
        title="Delete Admin Account"
        open={isOpen}
        onClose={close}
        actions={
          <>
            <Button onClick={close} variant="outlined" color="error">
              Cancel
            </Button>
            {selectedAccountId && (
              <Button
                onClick={() => handleDelete(selectedAccountId)}
                variant="contained"
                color="error"
              >
                Confirm Delete
              </Button>
            )}
          </>
        }
      >
        <Typography>Are you sure you want to delete this admin account?</Typography>
        <Typography>This action cannot be undone.</Typography>
      </DialogComp>
    </Box>
  );
};
export default AdminAccounts;
