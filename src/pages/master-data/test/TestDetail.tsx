import React, { useMemo } from "react";
import { Box, Card, Typography, Grid2 as Grid, Chip, Divider, IconButton } from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import parse from "html-react-parser";

const TestDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch subtest detail and criteria
  const { data: testDetail } = useFetch<{ data: any }>(`/test/${id}`);

  const testColumns: MRT_ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Sub Test Name",
        accessorKey: "subtest_name",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Sub Test Code",
        accessorKey: "subtest_code",
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
      {
        header: "Total Series",
        accessorKey: "series_count",
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
          const testId = row.original.subtest_id;
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <IconButton
                onClick={() => navigate(`/admin/subtest/detail/${testId}`)}
                aria-label="edit"
                size="small"
              >
                <VisibilityIcon />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    []
  );

  // Tables Configuration
  const subtestTable = useMaterialReactTable({
    columns: testColumns,
    data: testDetail?.data?.subtests || [],
    enablePagination: true,
    enableColumnFilters: false,
    enableSorting: true,
  });

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" color="primary" gutterBottom sx={{ mb: 0 }}>
          Test {testDetail?.data.test_code}
        </Typography>
      </Box>

      <Box>
        <Grid container spacing={2}>
          {/* Subtest Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Test Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Name: {testDetail?.data.test_name}</Typography>
              <Typography>Code: {testDetail?.data.test_code}</Typography>
              <Typography>
                Status:
                <Chip
                  label={testDetail?.data.is_active ? "Active" : "Inactive"}
                  color={testDetail?.data.is_active ? "success" : "error"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Card>
          </Grid>

          {/* Information Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Created By: {testDetail?.data.created_by}</Typography>
              <Typography>
                Created At:{" "}
                {testDetail?.data.created_at
                  ? moment(testDetail?.data.created_at).format("MMMM DD, YYYY hh:mm A")
                  : "-"}
              </Typography>
              <Typography>
                Updated By: {testDetail?.data.updated_by ? testDetail.data.updated_by : "-"}
              </Typography>
              <Typography>
                Updated At:{" "}
                {testDetail?.data.updated_at
                  ? moment(testDetail?.data.updated_at).format("MMMM DD, YYYY hh:mm A")
                  : "-"}
              </Typography>
            </Card>
          </Grid>

          {/* Information Card */}

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Intro Description{" "}
                <span style={{ color: "#666", fontSize: "12px" }}>
                  (Will be shown in test intro)
                </span>
              </Typography>
              <Divider sx={{ my: 1 }} />
              {parse(testDetail?.data.intro_desc || "")}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Description{" "}
                <span style={{ color: "#666", fontSize: "12px" }}>(Will be shown in report)</span>
              </Typography>
              <Divider sx={{ my: 1 }} />
              {parse(testDetail?.data.description || "")}
            </Card>
          </Grid>
          {/* Sub Test Table */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Sub Test
              </Typography>
              <MaterialReactTable table={subtestTable} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default TestDetail;
