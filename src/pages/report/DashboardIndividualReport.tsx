import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Info, Download } from "@mui/icons-material";
import { formatPeriod } from "@/utils/helper";
import useFetch from "@/hooks/useFetch";
import { useMemo, useRef, useState } from "react";
import {
  DialogListAssesseOnBatch,
  DialogListAssesseOnBatchRef,
} from "@/components/report/DialogListAssesseOnBatch";

export default function DashboardIndividualReport() {
  const { data: data_report, loading } = useFetch<any>("/batch?published=true");
  const [batch_id, setBatchId] = useState("");
  const [batch_name, setBatchname] = useState("");
  const refDialog = useRef<DialogListAssesseOnBatchRef>(null);
  const report_gen = useMemo(() => data_report?.data ?? [], [data_report]);
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
        return (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <IconButton
              size="small"
              onClick={() => {
                console.log(row);
                setBatchId(row.id);
                setBatchname(row.batch_name);
                refDialog.current?.open();
              }}
            >
              <Info fontSize="small" />
            </IconButton>
            <Tooltip title="Download Report">
              <IconButton>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];
  return (
    <>
      <DialogListAssesseOnBatch Batchid={batch_id} Batchname={batch_name} ref={refDialog} />
      <CustomTable columns={columns} data={report_gen} isLoading={loading} />
    </>
  );
}
