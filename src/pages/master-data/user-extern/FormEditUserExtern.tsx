import { useEffect } from "react";
import { useForm } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";
import { UserExtern } from "./DashboardUserExtern";
import { Box, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import useAPI from "@/hooks/useAPI";
import { AxiosResponse, isAxiosError } from "axios";
import { Show } from "@refinedev/mui";
import { Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import NumericFieldCtrl from "@/components/forms/NumericField";
import { snack } from "@/providers/SnackbarProvider";

export default function FormEditUserExtern() {
  const { userid } = useParams();
  const navigate = useNavigate();
  const api = useAPI();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserExtern>({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      gender: "",
      phone: "",
      education: "",
      institution: "",
      date_of_birth: "",
      nik: "",
    },
  });
  useEffect(() => {
    if (!userid) {
      return;
    }
    (async () => {
      try {
        const { data }: AxiosResponse<{ data: UserExtern }> = await api.get(
          "/extern/byid/" + userid
        );
        reset(data.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const submitUpdateNIK = async (value: UserExtern) => {
    console.log(value);
    try {
      const { data }: AxiosResponse<{ message: string }> = await api.post(`/extern`, {
        nik: value.nik,
        user_id: value.id,
      });
      snack.success(data.message);
      const timeout = setTimeout(() => {
        navigate(-1);
      }, 2000);

      clearTimeout(timeout);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    }
  };
  return (
    <Show
      title={
        <Typography fontWeight="600" variant="h5">
          Series Detail
        </Typography>
      }
      headerButtons={() => {
        return <></>;
      }}
      goBack={<IconButton children={<ArrowBack />} onClick={() => navigate(-1)} />}
    >
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextFieldCtrl name="name" label="Name" control={control} readOnly noMargin />
        <TextFieldCtrl name="email" label="Email" control={control} readOnly noMargin />
        <TextFieldCtrl
          name="gender"
          label="Gender"
          control={control}
          readOnly
          noMargin
          sx={{ width: "12rem" }}
        />
        <TextFieldCtrl
          name="date_of_birth"
          label="Date Of Birth"
          control={control}
          readOnly
          noMargin
          sx={{ width: "10rem" }}
        />
        <TextFieldCtrl
          name="phone"
          label="Phone"
          control={control}
          readOnly
          noMargin
          sx={{ minWidth: "17rem", maxWidth: "60rem" }}
        />
        <TextFieldCtrl
          name="education"
          label="Education"
          control={control}
          readOnly
          noMargin
          sx={{ width: "10rem" }}
        />
        <TextFieldCtrl
          name="institution"
          label="Institution"
          control={control}
          readOnly
          noMargin
          sx={{ width: "23rem" }}
        />
        <NumericFieldCtrl
          name="nik"
          label="NIK"
          control={control}
          noMargin
          allowLeadingZeros={true}
          maxLength={11}
          valueIsNumericString
          sx={{ width: "10rem" }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Button loading={isSubmitting} onClick={handleSubmit(submitUpdateNIK)}>
            Update
          </Button>
        </Box>
      </Box>
    </Show>
  );
}
