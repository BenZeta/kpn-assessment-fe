import useAPI from "@/hooks/useAPI";
import useFetch from "@/hooks/useFetch";
import { Box, Button, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { TableSkeleton } from "../../components/Skeleton";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import { useLoading } from "@/providers/LoadingProvider";
import { FaTrash } from "react-icons/fa";
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
  const { setValue, watch } = useFormContext();
  const getPermission = useAuthStore(state => state.getPermission);
  const { data: emailData } = useFetch<any>("/email-template");
  const { showLoading, hideLoading } = useLoading();
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);

  const emailDetail = watch("email_detail");
  const emailTemplateId = watch("email_template_id");

  const { isOpen: isOpenPreview, open: openPreview, close: closePreview } = useDialog();

  // Mencari email template yang dipilih berdasarkan ID yang tersimpan di form
  useEffect(() => {
    if (emailTemplateId && emailData?.data) {
      const selectedTemplate = emailData.data.find((email: any) => email.id === emailTemplateId);
      // Jika ada template yang dipilih, set ke state local untuk preview
      if (selectedTemplate) {
        setSelectedEmailTemplate(selectedTemplate);
      }
    }
  }, [emailTemplateId, emailData]);

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
    data: emailData?.data ?? [],
    getRowId: row => row.id,
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
      const previewRes = await API.get(`/batch/preview`);
      let previewTemplate = previewRes.data.template;
      const start_period =
        batchData.start_date && batchData.start_time
          ? dayjs(batchData.start_date)
              .hour(dayjs(batchData.start_time).hour())
              .minute(dayjs(batchData.start_time).minute())
              .second(0)
              .format("DD-MM-YYYY HH:mm:ss")
          : null;
      const end_period =
        batchData.end_date && batchData.end_time
          ? dayjs(batchData.end_date)
              .hour(dayjs(batchData.end_time).hour())
              .minute(dayjs(batchData.end_time).minute())
              .second(0)
              .format("DD-MM-YYYY HH:mm:ss")
          : null;

      previewTemplate = previewTemplate
        .replace("{{title}}", data.title || "")
        .replace("{{{header}}}", data.header || "")
        .replace("{{{footer}}}", data.footer || "")
        .replace("{{batch_name}}", batchData.batch_name || "")
        .replace("{{batch_code}}", batchData.batch_code || "")
        .replace("{{bu_name}}", batchData.bu_name || "")
        .replace("{{fm_name}}", batchData.fm_name || "")
        .replace("{{start_period}}", start_period || "")
        .replace("{{end_period}}", end_period || "");

      setPreviewData({
        data: {
          subject: data.subject,
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

  const handleSelectEmailTemplate = () => {
    if (selectedEmailTemplate) {
      setValue("email_template_id", selectedEmailTemplate.id);
      setValue("email_detail", {
        subject: selectedEmailTemplate.subject,
        template: previewData?.data.template || "",
      });

      closePreview();
    }
  };

  // Tambahkan fungsi untuk menghapus email yang dipilih
  const handleRemoveSelectedEmail = () => {
    setValue("email_template_id", "");
    setValue("email_detail", []);
    setSelectedEmailTemplate(null);
  };

  return (
    <>
      <Typography variant="h5" fontWeight={600}>
        Choose Email Template
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Choose Email Template for batch assignment. This email will be sent to the selected assessee
      </Typography>
      <Box sx={{ mt: 2 }}>
        {emailDetail && emailDetail.subject ? (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Subject: {emailDetail.subject}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FaTrash />}
                onClick={handleRemoveSelectedEmail}
              >
                Change Email
              </Button>
            </Box>
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
                srcDoc={emailDetail.template}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Selected Email Template"
              />
            </Box>
          </Box>
        ) : emailData ? (
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
            <Button variant="contained" onClick={handleSelectEmailTemplate}>
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
