import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { ListAssesseeperBatch } from "@/types/ReportTypes";
import { Preview } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Dialog, IconButton, Tooltip, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import CustomTable, { CustomTableColumn } from "../CustomTable";

export interface DialogListAssesseOnBatchRef {
  open: () => void;
}

interface DialogListAssesseOnBatchProps {
  Batchid: string;
  Batchname: string;
}

export const DialogListAssesseOnBatch = forwardRef<
  DialogListAssesseOnBatchRef,
  DialogListAssesseOnBatchProps
>((props, ref) => {
  const { Batchid, Batchname } = props;
  const API = useAPI();
  const [openDialog, setOpenDialog] = useState(false);
  const { data: data_user, loading } = useFetch<{ data: ListAssesseeperBatch[] }>(
    `/report/personal/${Batchid}`
  );
  const { showLoading, hideLoading } = useLoading()

  const handleDownloadReport = async (assessee_nik: string, assessee_email: string, batch_id: string) => {
    showLoading();
    try {
      const payload = {
        assessee_id: assessee_nik,
        assessee_email: assessee_email,
        batch_id: batch_id,
      }
      const res = await API.post(`/report/pdfgen`, payload, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${assessee_nik}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      if (isAxiosError(error)) {
        snack.error(error.response?.data?.message || "Failed to download report");
      } else {
        snack.error("An unexpected error occurred while downloading the report");
      }
    } finally {
      hideLoading();
    }
  }

  //column list user
  const columns = useMemo<CustomTableColumn<ListAssesseeperBatch>[]>(
    () => [
      {
        header: "NIK",
        accessorKey: "assessee_nik",
      },
      {
        header: "Name",
        accessorKey: "assessee_name",
      },
      {
        header: "Email",
        accessorKey: "assessee_email",
      },
      {
        header: "First Taken",
        accessorKey: "first_taken_subtest_at",
      },
      {
        header: "Last Finished",
        accessorKey: "last_finished_subtest_at",
      },
      {
        header: "Action",
        accessorKey: "assessee_nik",
        renderCell: row => {
          return (
            <>
            <Tooltip title="Preview Report" placement="top" arrow>
              <IconButton
                onClick={() => {
                  window.open(
                    `${location.protocol}//${location.hostname}${
                      import.meta.env.DEV ? ":5173" : ""
                    }/admin/inrepdes/preview?batch_id=${Batchid}&assessee_id=${
                      row.assessee_nik
                    }&assessee_email=${row.assessee_email}`
                  );
                }}
              >
                <Preview />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Report" placement="top" arrow>
              <IconButton
                onClick={() => handleDownloadReport(row.assessee_nik, row.assessee_email, Batchid)}
                >
                <DownloadIcon />
                </IconButton>
            </Tooltip>
            </>
          );
        },
      },
    ],
    [data_user]
  );

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
  }));
  return (
    <Dialog
      open={openDialog}
      onClose={() => {
        setOpenDialog(false);
      }}
      maxWidth="xl"
    >
      <Box sx={{ p: 4, height: "80dvh", width: "90dvw" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {Batchname}
        </Typography>
        <CustomTable
          columns={columns}
          data={data_user?.data ?? []}
          isLoading={loading}
          showSkeleton
        />
      </Box>
    </Dialog>
  );
});
