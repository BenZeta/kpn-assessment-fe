import useAPI from "@/hooks/useAPI";
import useDialog from "@/hooks/useDialog";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, Chip, Divider, MenuItem, Paper, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import React, { useEffect, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { GrAdd } from "react-icons/gr";
import { TableSkeleton } from "../../components/Skeleton";
import CustomSwitch from "../CustomSwitch";
import DialogComp from "../Dialog";
import SelectCtrl from "../forms/Select";
import TextFieldCtrl from "../forms/TextField";

type ChooseEmailProps = {
  control: Control<any>;
  batchData: any;
  initialRoleIds: string[];
  initialCcEmails: string[];
};

const ChooseEmail: React.FC<ChooseEmailProps> = ({
  batchData,
  control,
  initialRoleIds,
  initialCcEmails,
}) => {
  const API = useAPI();
  const { setValue, getValues, setError, watch, clearErrors } = useFormContext();
  const { data: emailData } = useFetch<any>("/email-template");
  const { data: roles } = useFetch<any>("/admin/role");
  const { showLoading, hideLoading } = useLoading();
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const [enableCustomEmail, setEnableCustomEmail] = useState(false);

  const roleIds = watch("role_id") || [];
  const deletedRoles = watch("deleted_roles") || [];
  const emailCC: string[] = watch("email_cc") || [];
  const deletedEmails: string[] = watch("deleted_emails") || [];

  const emailDetail = watch("email_detail");
  const emailTemplateId = watch("email_template_id");
  // const emailCCInput = watch("email_cc_input") || "";

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
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => handleOpenPreview(data)}
              size="small"
              color="success"
            >
              Preview
            </Button>
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
        .replace("{{end_period}}", end_period || "")
        .replace("{{{body}}}", data.body || "");

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

  const handleAddCCEmail = () => {
    const email = getValues("email_cc_input");

    let hasError = false;
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("email_cc_input", {
        type: "manual",
        message: "Invalid email format",
      });
    } else if (emailCC.includes(email)) {
      setError("email_cc_input", {
        type: "manual",
        message: "Email already added",
      });
      hasError = true;
    }

    if (hasError) return;

    // Add email to CC list
    const newCC: string[] = [...emailCC, email];
    setValue("email_cc", newCC);
    // setValue("email_cc_input", ""); // Clear the input field
    clearErrors("email_cc_input"); // Clear any errors
  };

  const handleRemoveCCEmail = (email: string) => {
    if (initialCcEmails.includes(email)) {
      setValue("deleted_emails", [...deletedEmails, email]);
    }
    setValue(
      "email_cc",
      emailCC.filter(e => e !== email)
    );
  };

  const handleRemoveRole = (roleId: string) => {
    if (initialRoleIds.includes(roleId)) {
      setValue("deleted_roles", [...deletedRoles, roleId]);
    }
    setValue(
      "role_id",
      roleIds.filter((r: string) => r !== roleId)
    );
  };

  const handleRoleChange = (newRoles: string[]) => {
    // clear deleted if re-added
    const stillDeleted: string[] = deletedRoles.filter((r: string) => !newRoles.includes(r));
    setValue("deleted_roles", stillDeleted);
    setValue("role_id", newRoles);
  };

  return (
    <>
      <Typography variant="h5" fontWeight={600}>
        CC Email
      </Typography>
      <Typography variant="body2" color="textSecondary">
        You can CC an email to a spesific role on this platform or to a specific email address.
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 2,
          mt: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <SelectCtrl
            name="role_id"
            label="Roles"
            control={control}
            multiple={true}
            onChangeOvr={(e: React.ChangeEvent<{ value: unknown }>) =>
              handleRoleChange(e.target.value as string[])
            }
            renderValue={selected => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value: string) => {
                  const role = roles?.data?.find((r: any) => r.id === value);
                  const isDeleted = deletedRoles.includes(value);
                  return (
                    <Chip
                      key={value}
                      label={role?.role_name + (isDeleted ? " (will delete)" : "")}
                      size="small"
                      variant="outlined"
                      color={isDeleted ? "error" : undefined}
                      onDelete={() => handleRemoveRole(value)}
                    />
                  );
                })}
              </Box>
            )}
          >
            {roles?.data.map((role: any) => (
              <MenuItem key={role.id} value={role.id}>
                {role.role_name}
              </MenuItem>
            ))}
          </SelectCtrl>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
        <CustomSwitch
          value={enableCustomEmail}
          onChange={() => setEnableCustomEmail(!enableCustomEmail)}
        />
        <Typography variant="body2" color="textSecondary">
          Add another email address to CC
        </Typography>
      </Box>
      {enableCustomEmail && (
        <Box sx={{ display: "flex", gap: 2, mt: 2, width: "100%" }}>
          <TextFieldCtrl
            name="email_cc_input"
            label="CC Email"
            control={control}
            placeholder="adi@email.com"
            sx={{ flex: 1 }}
            rules={{
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email format",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<GrAdd />}
            onClick={handleAddCCEmail}
            sx={{ maxHeight: 55 }}
            size="small"
            color="success"
          >
            Add
          </Button>
        </Box>
      )}
      {emailCC.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            backgroundColor: "background.paper",
          }}
        >
          {emailCC.map((email: string, index: number) => (
            <Chip
              key={index}
              label={email}
              onDelete={() => handleRemoveCCEmail(email)}
              size="medium"
              color="primary"
              variant="outlined"
            />
          ))}
        </Paper>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" fontWeight={600}>
        Choose Email Template
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Select Batch Assignment Email Template. This email will be sent to the selected assessee.
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
          <MaterialReactTable table={table} />
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
            <Button
              variant="contained"
              onClick={handleSelectEmailTemplate}
              color="success"
              startIcon={<CheckBoxIcon />}
            >
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
