import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { TableSkeleton } from "@/components/Skeleton";
import useAPI from "@/hooks/useAPIDarwin";
import useFetch from "@/hooks/useFetch";
import { ArrowBack } from "@mui/icons-material";
import { Box, Chip, Divider, IconButton, Typography } from "@mui/material";
import { Show } from "@refinedev/mui";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

const BatchDetail: React.FC = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, loading } = useFetch<any>(`/batch/${id}`);
  const batch = data?.data.batch;
  const assessees = data?.data.assessees;

  console.log(JSON.stringify(batch, null, 2));

  const handleGetGroupTest = async () => {
    try {
      const response = await API.get(`/grouptest/${batch?.grouptest_id}`);
      console.log("Group Test: ", response.data.data);
    } catch (error) {
      console.error("Error fetching group test", error);
    }
  };
  React.useEffect(() => {
    handleGetGroupTest();
  }, [id]);

  const columns: CustomTableColumn<any>[] =
    batch?.type === "external"
      ? [
          {
            accessorKey: "assessee_name",
            header: "Name",
            size: 200,
            enableGlobalFilter: true,
          },
          {
            accessorKey: "assessee_email",
            header: "Email",
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            size: 200,
          },
          {
            header: "Status",
            accessorKey: "status",
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            renderChip: value => ({
              label: value,
              color:
                value === "Not Taken" ? "error" : value === "In Progress" ? "warning" : "success",
              variant: "filled",
            }),
          },
        ]
      : [
          {
            accessorKey: "assessee_nik",
            header: "NIK",
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            size: 100,
          },
          {
            accessorKey: "assessee_name",
            header: "Name",
            size: 200,
          },
          {
            accessorKey: "assessee_email",
            header: "Email",
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            size: 200,
          },
          {
            header: "Status",
            accessorKey: "status",
            muiTableHeadCellProps: { align: "center" },
            muiTableBodyCellProps: { align: "center" },
            renderChip: value => ({
              label: value,
              color:
                value === "Not Taken" ? "error" : value === "In Progress" ? "warning" : "success",
              variant: "filled",
            }),
          },
        ];

  if (loading) {
    return <TableSkeleton column={4} row={2} />;
  }

  return (
    <Show
      title={<h1>Batch Detail</h1>}
      goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
      headerButtons
    >
      <Box px={7}>
        <Box>
          <Typography variant="h6" color="textSecondary" fontWeight={600}>
            {batch?.batch_code}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="h2" fontWeight={600}>
              {batch?.batch_name}
            </Typography>
            <Chip
              label={batch?.status}
              variant="outlined"
              size="small"
              color={batch?.status === "Draft" ? "info" : "success"}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {batch?.description}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", flexDirection:'column', gap: 2 }}>
          <Typography variant="h6">
            <strong>Assign for: </strong>{" "}
            <Chip
              label={batch?.type.charAt(0).toUpperCase() + batch?.type.slice(1)}
              color={batch?.type === "external" ? "info" : "primary"}
              variant="outlined"
              size="small"
            />
          </Typography>
          <Typography variant="h6">
            <strong>Batch period:</strong>{" "}
            {dayjs(batch?.start_period).format("DD/MM/YYYY HH:mm")} -{" "}
            {dayjs(batch?.end_period).format("DD/MM/YYYY HH:mm")}
            </Typography>
        </Box>
        <Box mt={2}>
          <CustomTable
            data={assessees || []}
            columns={columns}
            emptyStateMessage="Assesse Not Found"
            enableFilters={true}
          />
        </Box>
      </Box>
    </Show>
  );
};
export default BatchDetail;
