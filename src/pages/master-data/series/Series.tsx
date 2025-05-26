import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import DialogComp from "@/components/Dialog";
import { TableSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPI";
import useAuthStore from "@/hooks/useAuthStore";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { snack } from "@/providers/SnackbarProvider";
import { Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Create } from "@refinedev/mui";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ActionsModal {
  onYes: () => Promise<void>;
  onNo: () => void;
}

const ActionsModal = ({ onYes, onNo }: ActionsModal) => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        loading={loading}
        onClick={async () => {
          try {
            setLoading(true);
            await onYes();
          } catch (error) {
          } finally {
            setLoading(false);
          }
        }}
      >
        Yes
      </Button>
      <Button variant="contained" onClick={() => onNo()}>
        No
      </Button>
    </>
  );
};

const Series: React.FC = () => {
  const navigate = useNavigate();
  const api = useAPI();
  const { data: series, refetch, loading } = useFetch<any>("/series");
  const getPermission = useAuthStore(state => state.getPermission);
  const [selectedSeries, setSelectedSeries] = useState({
    id: "",
    series_id: "",
    series_name: "",
    category_name: "",
  });

  const { open: openModal, isOpen: isOpenModal, close: closeModal } = useDialog();

  const columns: CustomTableColumn<any>[] = [
    {
      header: "Series Name",
      accessorKey: "series_name",
    },
    {
      header: "Series Code",
      accessorKey: "series_code",
    },
    {
      header: "Created By",
      accessorKey: "created_by",
    },
    {
      header: "Created Date",
      accessorKey: "created_at",
      renderCell: (row: any) => {
        return dayjs(row.created_at).format("DD MMM YYYY");
      },
    },
    {
      header: "Total Question",
      accessorKey: "question_count",
      // muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      id: "action",
      header: "Action",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      enableColumnActions: false,
      enableSorting: false,
      enableResizing: false,
      Cell: ({ row }) => {
        const id = row.original.id;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            {getPermission("fupdate", 5) && (
              <Tooltip title="Edit Series" placement="top" arrow>
                <IconButton
                  size="small"
                  children={<EditIcon sx={{ color: "secondary.dark" }} />}
                  onClick={() => handleEditSeries(id)}
                />
              </Tooltip>
            )}
            <Tooltip title="View Details" placement="top" arrow>
              <IconButton
                size="small"
                // color='info'
                children={<InfoIcon sx={{ color: "info.light" }} />}
                onClick={() => navigate(`/admin/series/${id}`)}
              />
            </Tooltip>
            {getPermission("fdelete", 6) && (
              <Tooltip title="Delete Series" placement="top" arrow>
                <IconButton
                  size="small"
                  children={<Delete color="primary" />}
                  onClick={() => handleOpenModalDelete(row.original)}
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const handleOpenModalDelete = (row: any) => {
    setSelectedSeries(row);
    console.log(row);
    openModal();
  };

  const handleEditSeries = (id: string) => {
    navigate(`/admin/series/create/${id}`);
  };

  const onDeleteSeries = async (id: string) => {
    try {
      const { data } = await api.delete(`/series/${id}`);
      snack.success(data.message);
      refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      }
    }
  };

  return (
    <Create
      title={
        <Typography variant="h1" color="primary">
          Series
        </Typography>
      }
      headerButtons={({ defaultButtons }) => {
        return (
          <>
            {defaultButtons}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/admin/series/create")}
            >
              Create New Series
            </Button>
          </>
        );
      }}
      footerButtons
      goBack
    >
      {/* <MaterialReactTable table={table} /> */}
      <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {loading ? (
          <TableSkeleton column={4} row={2} small />
        ) : (
          <CustomTable
            columns={columns}
            data={series?.data || []}
            isLoading={!series}
            enableFilters={true}
          />
        )}
      </Box>

      <DialogComp
        actions={
          <ActionsModal
            onYes={async () => await onDeleteSeries(selectedSeries.id)}
            onNo={closeModal}
          />
        }
        title={`Delete Series`}
        open={isOpenModal}
        onClose={closeModal}
      >
        <Typography>{`Are you sure you want to delete this series?`}</Typography>
      </DialogComp>
    </Create>
  );
};
export default Series;
