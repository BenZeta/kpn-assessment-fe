import { useMemo, useRef, useState } from "react";
import CustomTable, { CustomTableColumn } from "@/components/CustomTable";
import { Box, IconButton, Tooltip } from "@mui/material";
import { EditSharp, LockReset } from "@mui/icons-material";
import useFetch from "@/hooks/useFetch";
import { useNavigate } from "react-router-dom";
import DialogFormConfirmation, {
  RefDialogConfirmation,
} from "@/components/common/DialogFormConfirmation";
import useAPI from "@/hooks/useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosResponse, isAxiosError } from "axios";

export type UserExtern = {
  id: string;
  name: string;
  email: string;
  gender: string;
  phone: string;
  education: string;
  institution: string;
  date_of_birth: string;
  nik: string;
};

function FormConfirmSendResetPass({ name }: { name: string }) {
  return (
    <Box sx={{ p: 3 }}>
      {`Are you sure want to send email "Reset User Extern Password" to ${name} ?`}
    </Box>
  );
}

export default function DashboardUserExtern() {
  const api = useAPI();
  const { data, loading, error } = useFetch<{ data: UserExtern[] }>("/extern?user_id=");
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ name: string; user_id: string }>({
    name: "",
    user_id: "",
  });
  const modalRef = useRef<RefDialogConfirmation>(null);
  const onYesFormConfirm = async () => {
    try {
      const { data }: AxiosResponse<{ message: string }> = await api.post("/extern/reqreset", {
        user_id: userData.user_id,
      });
      snack.success(data.message);
      modalRef.current?.setOpen(false);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    }
  };

  const columns = useMemo<CustomTableColumn<UserExtern>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Action",
        accessorKey: "id",
        renderCell: row => {
          return (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Tooltip title={"Edit User"} placement="top" arrow>
                <IconButton
                  onClick={() => {
                    navigate("/admin/userext/edit/" + row.id);
                    console.log(row.id);
                  }}
                >
                  <EditSharp />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Reset Password"} placement="top" arrow>
                <IconButton
                  onClick={() => {
                    setUserData({ name: row.name, user_id: row.id });
                    modalRef.current?.setOpen(true);
                  }}
                >
                  <LockReset />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <CustomTable columns={columns} data={data?.data ?? []} isLoading={loading} showSkeleton />;
      <DialogFormConfirmation
        ref={modalRef}
        Title="Send Email Reset Password"
        Content={<FormConfirmSendResetPass name={userData.name} />}
        onYes={onYesFormConfirm}
        onNo={() => {}}
      />
    </>
  );
}
