import { Dialog, IconButton, Box, Typography } from "@mui/material";
import CustomTable, { CustomTableColumn } from "../CustomTable";
import { Preview } from "@mui/icons-material";
import { MRT_ColumnDef } from "material-react-table";
import { ListAssesseeperBatch } from "@/types/ReportTypes";
import useFetch from "@/hooks/useFetch";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

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
  const [openDialog, setOpenDialog] = useState(false);
  const { data: data_user, loading } = useFetch<{ data: ListAssesseeperBatch[] }>(
    `/report/personal/${Batchid}`
  );

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
