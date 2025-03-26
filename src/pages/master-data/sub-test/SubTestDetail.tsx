import React, { useMemo } from "react";
import { Box, Card, Typography, Grid, Chip, Divider, IconButton } from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SubTestDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch subtest detail and criteria
  const { data: subtestDetail } = useFetch<{ data: any }>(`/subtest/${id}`);
  const criteriaId = subtestDetail?.data?.criteria_id;
  const { data: criteria } = useFetch<{ data: any }>(
    criteriaId ? `/criteria/${criteriaId}` : null // atau beri kondisi agar tidak memanggil API
  );
  // Series Table Columns
  const seriesColumns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Series Name",
        accessorKey: "series_name",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Series Code",
        accessorKey: "series_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Total Question",
        accessorKey: "question_count",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Added By",
        accessorKey: "added_by",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Added At",
        accessorKey: "added_at",
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
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              aria-label="preview"
              size="small"
              onClick={() => {
                window.open(
                  `${window.location.protocol}//${window.location.host}/admin/series/${row.original.series_id}`
                );
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  // Criteria Table Columns
  const criteriaColumns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Criteria",
        accessorKey: "criteria_name",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Min",
        accessorKey: "minimum_score",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Max",
        accessorKey: "maximum_score",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
    ],
    []
  );

  // Tables Configuration
  const seriesTable = useMaterialReactTable({
    columns: seriesColumns,
    data: subtestDetail?.data?.series || [],
    enablePagination: true,
    enableColumnFilters: false,
    enableSorting: true,
  });

  const criteriaTable = useMaterialReactTable({
    columns: criteriaColumns,
    data: criteria?.data?.criterias || [],
    enablePagination: false,
    enableColumnFilters: false,
    enableSorting: false,
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render
  if (!subtestDetail?.data) return null;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" color="primary" gutterBottom>
          Subtest {subtestDetail.data.subtest_code}
        </Typography>
      </Box>

      <Box>
        <Grid container spacing={2}>
          {/* Subtest Information */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Subtest Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Name: {subtestDetail.data.subtest_name}</Typography>
              <Typography>Code: {subtestDetail.data.subtest_code}</Typography>
              <Typography>Duration: {subtestDetail.data.subtest_duration}</Typography>
              <Typography>
                Status:
                <Chip
                  label={subtestDetail.data.is_active ? "Active" : "Inactive"}
                  color={subtestDetail.data.is_active ? "success" : "error"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Card>
          </Grid>

          {/* Information Card */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Created By: {subtestDetail.data.created_by}</Typography>
              <Typography>Created At: {formatDate(subtestDetail.data.created_at)}</Typography>
              <Typography>Updated By: {subtestDetail.data.updated_by}</Typography>
              <Typography>Updated At: {formatDate(subtestDetail.data.updated_at)}</Typography>
            </Card>
          </Grid>

          {/* Criteria Information */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Criteria
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Name: {criteria?.data?.value_name || "N/A"}</Typography>
              <Typography>Code: {criteria?.data?.value_code || "N/A"}</Typography>
            </Card>
          </Grid>

          {/* Criteria Table */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Criteria Scores
              </Typography>
              <MaterialReactTable table={criteriaTable} />
            </Card>
          </Grid>

          {/* Series Table */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Series
              </Typography>
              <MaterialReactTable table={seriesTable} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SubTestDetail;
