import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { ArrowBack, Delete } from "@mui/icons-material";
import { Button, IconButton, Typography } from "@mui/material";
import { Create, Edit } from "@refinedev/mui";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Series: React.FC = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const { data: series } = useFetch<any>("/series");

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
          return (
            <div>
              <IconButton
              // onClick={() => {
              //   handleDelete(row.id);
              // }}
              >
                <Delete />
              </IconButton>
            </div>
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
      goBack={
        <IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />
      }
    >
      <MaterialReactTable table={table} />
    </Create>
  );
};
export default Series;
