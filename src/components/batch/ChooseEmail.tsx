import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { Box, Button, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { Control } from "react-hook-form";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { TableSkeleton } from "../../components/Skeleton";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useLoading } from "@/providers/LoadingProvider";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useDialog from "@/hooks/useDialog";
import DialogComp from "../Dialog";
import useAuthStore from "@/hooks/useAuthStore";
import dayjs from "dayjs";

type ChooseEmailProps = {
  control: Control<any>;
  batchData: any;
};

const ChooseEmail: React.FC<ChooseEmailProps> = ({ batchData }) => {
  const API = useAPI();
  const getPermission = useAuthStore((state) => state.getPermission);
  const { data: emailTemplate } = useFetch<any>("/email-template");
  const { showLoading, hideLoading } = useLoading();
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const {
    isOpen: isOpenPreview,
    open: openPreview,
    close: closePreview,
  } = useDialog();
  const columns: MRT_ColumnDef<any>[] = [
    {
      header: "Subject",
      accessorKey: "subject",
      muiTableHeadCellProps: { align: "center" },
      muiTableBodyCellProps: { align: "center" },
    },
    {
      header: "Created By",
      accessorKey: "created_by",
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
        const data = row.original;
        return (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
              <IconButton
                onClick={() => handleOpenPreview(data)}
                aria-label="preview"
                size="small"
                edge="end"
                sx={{ mr: 1 }}
              >
                <VisibilityIcon />
              </IconButton>
            </Box>
          </>
        );
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: emailTemplate?.data ?? [],
    getRowId: (row) => row.id,
    enablePagination: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: false,
    enableRowActions: false,
  });
  const handleOpenPreview = async (data: any) => {
    setSelectedEmailTemplate(data);
    showLoading();
    try {
      // Ambil preview template HTML
      const previewRes = await API.get(`/batch/preview`);
      let previewTemplate = previewRes.data.template;
      // console.log("previewTemplate", previewTemplate);
      const start_period =
        batchData.start_date && batchData.start_time
          ? dayjs(batchData.start_date)
              .hour(dayjs(batchData.start_time).hour())
              .minute(dayjs(batchData.start_time).minute())
              .second(0)
              .format("YYYY-MM-DD HH:mm:ss")
          : null;
      const end_period = batchData.end_date && batchData.end_time 
          ? dayjs(batchData.end_date)
              .hour(dayjs(batchData.end_time).hour())
              .minute(dayjs(batchData.end_time).minute())
              .second(0)
              .format("YYYY-MM-DD HH:mm:ss")
          : null;
      
      // Ganti placeholder dengan data dari template yang dipilih
      previewTemplate = previewTemplate
        .replace("{{title}}", selectedEmailTemplate.title || "")
        .replace("{{{header}}}", selectedEmailTemplate.header || "")
        .replace("{{{footer}}}", selectedEmailTemplate.footer || "")
        .replace("{{batch_name}}", batchData.batch_name || "")
        .replace("{{batch_code}}", batchData.batch_code || "")
        .replace("{{bu_name}}", batchData.bu_name || "")
        .replace("{{fm_name}}", batchData.fm_name || "")
        .replace("{{start_period}}", start_period || "")
        .replace("{{end_period}}", end_period || "")

      // Simpan hasilnya ke state dengan format yang sama seperti response asli
      setPreviewData({
        data: {
          subject: selectedEmailTemplate.subject,
          template: previewTemplate,
        },
      });

      openPreview();
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
        console.error(error.response);
      } else {
        snack.error("Error loading preview");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };
  return (
    <>
      <Typography variant="h5" fontWeight={600}>
        Choose Email Template
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Choose Email Template for batch assignment. This email will be sent to
        the selected assessee
      </Typography>
      <Box sx={{ mt: 2 }}>
        {emailTemplate ? (
          getPermission("fread", 1) && <MaterialReactTable table={table} />
        ) : (
          <TableSkeleton column={4} row={2} small />
        )}
      </Box>
      <DialogComp
        title={"Email Template Preview"}
        open={isOpenPreview}
        onClose={closePreview}
        maxWidth="md"
        actions={
          <>
            <Button variant="outlined" onClick={closePreview}>
              Close
            </Button>
            <Button variant="contained" onClick={closePreview}>
              Select
            </Button>
          </>
        }
      >
        {previewData ? (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Subject: {previewData.data.subject}
            </Typography>
            <Box
              sx={{
                mt: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                height: "60vh",
                overflow: "auto",
              }}
            >
              <iframe
                srcDoc={previewData.data.template}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Email Template Preview"
              />
            </Box>
          </Box>
        ) : (
          <Typography>Loading preview...</Typography>
        )}
      </DialogComp>
    </>
  );
};
export default ChooseEmail;
