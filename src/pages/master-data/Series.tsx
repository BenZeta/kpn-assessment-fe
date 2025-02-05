import DialogComp from "@/components/Dialog";
import useAPI from "@/hooks/useAPI";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { Delete, Visibility } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { Create } from "@refinedev/mui";
import dataProvider from "@refinedev/simple-rest";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { useForm } from "@refinedev/react-hook-form";

const Series: React.FC = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const { data: series } = useFetch<any>("/series");
  const [selectedSeries, setSelectedSeries] = useState({
    series_id: "",
    series_name: "",
    category_name: "",
  });
  console.log("selectedSeries", selectedSeries.series_id);
  const { data: question } = useFetch<any>(
    `series/${selectedSeries.series_id}/questions`
  );

  // const {showLoading, hideLoading} = useLoading();
  const {
    open: openModal,
    isOpen: isOpenModal,
    close: closeModal,
  } = useDialog();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
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
        header: "Category",
        accessorKey: "category_name",
      },
      {
        header: "Total Question",
        accessorKey: "question_count",
      },
      {
        id: "action",
        header: "Action",
        enableColumnActions: false,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        Cell: ({ row }) => {
          const id = row.original.id;
          const { series_name } = row.original;

          return (
            <Box sx={{ display: "flex" }}>
              <IconButton children={<FaRegEdit />} />
              <IconButton
                children={<Visibility />}
                onClick={() => handleOpenModal(row.original, id)}
              />
              <IconButton children={<Delete />} />
            </Box>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: series?.result?.data || [],
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
  });

  const columnsQuestion: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Question",
        accessorKey: "q_input_text",
      },
      {
        header: "Question Code",
        accessorKey: "question_code",
      },
      {
        header: "Category",
        accessorKey: "category_code",
      },
      {
        header: "Created By",
        accessorKey: "added_by",
      },
      {
        id: "action",
        header: "Action",
        enableColumnActions: false,
        enableSorting: false,
        enableResizing: false,
        size: 50,
        Cell: ({ row }) => {
          const id = row.original.id;
          const { question } = row.original;

          return (
            <Box sx={{ display: "flex" }}>
              <IconButton children={<FaRegEdit />} />
              <IconButton children={<Delete />} />
            </Box>
          );
        },
      },
    ],
    []
  );

  const tableQuestion = useMaterialReactTable({
    columns: columnsQuestion,
    data: question?.data?.data || [],
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
  });

  const handleOpenModal = (row: any, id?: string) => {
    setSelectedSeries(row);
    openModal();
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
      <DialogComp
        title={selectedSeries.series_name}
        open={isOpenModal}
        onClose={closeModal}
        actions={<Button startIcon={<RxCross1 />} onClick={() => closeModal()}>Close</Button>}
      >
        <MaterialReactTable table={tableQuestion} />
      </DialogComp>
    </Create>
  );
};
export default Series;
