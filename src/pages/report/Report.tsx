import useAPI from "@/hooks/useAPI.tsx";
import useAuthStore from "@/hooks/useAuthStore.tsx";
import { useLoading } from "@/providers/LoadingProvider.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import { useMemo } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
    MaterialReactTable,
    MRT_ColumnDef,
    useMaterialReactTable,
} from "material-react-table";
import { TableSkeleton } from "@/components/Skeleton.tsx";
import { snack } from "@/providers/SnackbarProvider.tsx";
import { isAxiosError } from "axios";
import DownloadIcon from "@mui/icons-material/Download";

const BatchReport = () => {
    const API = useAPI();
    const navigate = useNavigate();
    const getPermission = useAuthStore((state) => state.getPermission);
    const { showLoading, hideLoading } = useLoading();
    const { data: batch, refetch } = useFetch<{ data: any[] }>("/batch");

    const handleDownloadReport = async (batchId: string, batchName: string, batchCode: string) => {
        showLoading();
        try {
            const response = await API.get(`/report/${batchId}`, {
                responseType: 'blob',
            });

            // Buat URL objek dari blob
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Buat elemen anchor untuk download
            const link = document.createElement('a');
            link.href = url;

            // Ambil filename dari headers Content-Disposition jika ada
            const contentDisposition = response.headers['content-disposition'];
            let filename;

            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Jika tidak ada nama file dari header, gunakan default
            link.setAttribute('download', filename || `${batchName}-${batchCode}-report.xlsx`);

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
                console.error('Error downloading report:', error);
            }
        } finally {
            hideLoading();
        }
    };

    const columns: MRT_ColumnDef<any>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "batch_name",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Code",
                accessorKey: "batch_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Total Assessee",
                accessorKey: "total_assessee",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Start Period",
                accessorKey: "start_period",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "End Period",
                accessorKey: "end_period",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Business Unit Code",
                accessorKey: "bu_code",
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
            },
            {
                header: "Function Menu Code",
                accessorKey: "fm_code",
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
                Cell: ({ row }) => {
                    const id = row.original.id;
                    const batch_name = row.original.batch_name;
                    const batch_code = row.original.batch_code;
                    return (
                        <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
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
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: batch?.data ?? [],
        getRowId: (row) => row.id,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        enableRowSelection: false,
        enableRowActions: false,
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h2" component="div">
                    Report
                </Typography>
            </Box>

            {batch?.data?.length ? (
                getPermission("fread", 13) && <MaterialReactTable table={table} />
            ) : (
                <TableSkeleton column={4} row={2} small />
            )}
        </Box>
    );
};

export default BatchReport;