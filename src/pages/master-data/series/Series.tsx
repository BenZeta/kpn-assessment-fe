import DialogComp from "@/components/Dialog";
import QuestionCard, { QuestionData } from "@/components/question/QuestionCard";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { Delete, Visibility } from "@mui/icons-material";
import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Series: React.FC = () => {
  const navigate = useNavigate();
  const { data: series } = useFetch<any>("/series");
  const [selectedSeries, setSelectedSeries] = useState({
    series_id: "",
    series_name: "",
    category_name: "",
  });
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null);

  const { open: openModal, isOpen: isOpenModal, close: closeModal } = useDialog();

  const {} = useForm({
    defaultValues: {
      series_name: "",
      series_code: "",
      category_id: "",
      question_id: [],
      detail: [],
    },
  });

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () => [
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
      },
      {
        header: "Total Question",
        accessorKey: "question_count",
      },
      // {
      //   header: "Is Active",
      //   accessorKey: "is_active",
      // },
      {
        id: "action",
        header: "Action",
        enableColumnActions: false,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        Cell: ({ row }) => {
          const id = row.original.id;

          return (
            <Box sx={{ display: "flex" }}>
              <IconButton children={<FaRegEdit />} onClick={() => handleEditSeries(id)} />
              <IconButton
                children={<Visibility />}
                onClick={() => navigate(`/admin/series/${id}`)}
              />
              <IconButton
                children={<Delete />}
                onClick={() => handleOpenModalDelete(row.original, id)}
              />
            </Box>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: series?.data || [],
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
  });

  const handleOpenModalDelete = (row: any, id?: string) => {
    setSelectedSeries(row);
    openModal();
  };

  const handleEditSeries = (id: string) => {
    navigate(`/admin/series/create/${id}`);
  };

  return (
    <Create
      title={
        <Typography variant="h5" fontWeight="600">
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
      <MaterialReactTable table={table} />
      <Modal
        keepMounted
        open={isOpenModal}
        onClose={closeModal}
        sx={{
          alignContent: "center",
          justifySelf: "center",
          width: "80%",
          maxWidth: "sm",
        }}
      >
        <Box
          sx={{
            maxWidth: "sm",
            maxHeight: "90vh", // Set maximum height relative to viewport height
            bgcolor: "background.paper",
            borderRadius: 1,
            p: 2,
            overflow: "auto", // Enable scrolling
          }}
        >
          <QuestionCard questionData={selectedQuestion} />
        </Box>
      </Modal>
      <DialogComp title={`Delete Series`} open={isOpenModal} onClose={closeModal}>
        <Typography>{`Are you sure you want to delete this series?`}</Typography>
      </DialogComp>
    </Create>
  );
};
export default Series;
