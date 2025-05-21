import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const BatchReport = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const getPermission = useAuthStore(state => state.getPermission);
  const { showLoading, hideLoading } = useLoading();
  const { data: batch } = useFetch<{ data: any[] }>("/batch");

  const handleDownloadReport = async (batchId: string, batchName: string, batchCode: string) => {
    showLoading();
    try {
      const response = await API.get(`/report/${batchId}`, {
        responseType: "blob",
      });

      // Buat URL objek dari blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Buat elemen anchor untuk download
      const link = document.createElement("a");
      link.href = url;

      // Ambil filename dari headers Content-Disposition jika ada
      const contentDisposition = response.headers["content-disposition"];
      let filename;

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Jika tidak ada nama file dari header, gunakan default
      link.setAttribute("download", filename || `${batchName}-${batchCode}-report.xlsx`);

      // Append link ke body (tidak terlihat)
      document.body.appendChild(link);

      // Klik link untuk memulai download
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      snack.success("Report downloaded successfully");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data?.message || "Failed to download report");
      } else {
        snack.error("Error downloading report");
        console.error("Error downloading report:", error);
      }
    } finally {
      hideLoading();
    }
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;
  };

  const columns: CustomTableColumn<any>[] = [
    {
      header: "Name",
      accessorKey: "batch_name",
      muiTableHeadCellProps: { align: "left" },
      muiTableBodyCellProps: { align: "left" },
    },
    {
      header: "Code",
      accessorKey: "batch_code",
      muiTableHeadCellProps: { align: "left" },
      muiTableBodyCellProps: { align: "left" },
    },
    {
      header: "Total Assessee",
      accessorKey: "total_assessee",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Type",
      accessorKey: "type",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      renderChip: value => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        color: value === "external" ? "info" : "primary",
        variant: "outlined",
      }),
    },
    {
      header: "Status",
      accessorKey: "status",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      renderChip: value => ({
        label: value,
        color: value === "Draft" ? "info" : "success",
        variant: "outlined",
      }),
    },
    {
      header: "Period",
      accessorFn: row => formatPeriod(row.start_period, row.end_period),
      id: "period",
      enableSorting: true,
      sortingFn: "datetime",
      muiTableHeadCellProps: { align: "left" },
      muiTableBodyCellProps: { align: "left" },
      sortDescFirst: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      enableColumnFilter: false,
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
      renderCell: row => {
        const id = row.id;
        const batch_name = row.batch_name;
        const batch_code = row.batch_code;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
            <Tooltip title="Download Report">
              <IconButton
                onClick={() => handleDownloadReport(id, batch_name, batch_code)}
                aria-label="download report"
                size="small"
                color="primary"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h2" component="div">
          Report
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <CustomTable
          columns={columns}
          data={batch?.data || []}
          isLoading={!batch}
          hasPermission={getPermission("fread", 13)}
          defaultSortingField="period"
          defaultSortingDirection="desc"
          onRowClick={row => {
            navigate("create", { state: { batchId: row.id } });
          }}
        />
      </Box>
    </Box>
  );
};

export default BatchReport;
