import { useRef, useEffect, useState } from "react";
import { Card, Box, Avatar, Skeleton, Button, MenuItem } from "@mui/material";
import SettingsToolbar, { SettingsToolbarRef } from "./SettingsToolbar";
import useAuthDarwinStore from "@/hooks/useAuthDarwinStore";
import useTokenDarwin from "@/hooks/useTokenDarwin";
import useAuthExternStore from "@/hooks/useAuthExternStore";
import TextFieldCtrl from "@/components/forms/TextField";
import { useForm } from "react-hook-form";
import NumericFieldCtrl from "@/components/forms/NumericField";
import DatePickerCtrl from "@/components/forms/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import SelectCtrl from "@/components/forms/Select";
import useAPI from "@/hooks/useAPIExt";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosResponse, isAxiosError } from "axios";
import { ResponseDataEmpExt } from "@/types/AssessmentTypes";
import useTokenAssessee from "@/hooks/useTokenAssessee";

const Gender = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

export default function CardProfileClient() {
  const api = useAPI();
  const darwin_sess = useAuthDarwinStore(state => state.darwin_sess);
  const type = useTokenAssessee(state => state.type);
  const id = darwin_sess?.employee_id;
  const data_ext = useAuthExternStore(state => state.ext_sess);
  const setExternStore = useAuthExternStore(state => state.setExternStore);
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      date_of_birth: "",
      date_of_birth_1: dayjs(),
      institution: "",
      education: "",
      phone: "",
      date_join: "",
      comp_payroll: "",
      role_name: "",
      email: "",
      degree: "",
      gender: "",
    },
  });
  const settingsRef = useRef<SettingsToolbarRef | null>(null);
  const [edit_mode, setEditMode] = useState(false);
  const data_emp = useAuthDarwinStore(state => state.darwin_sess);
  useEffect(() => {
    console.log("data_emp", data_emp);
    console.log("data_ext", data_ext);
    if (data_emp) {
      reset({
        date_of_birth: data_emp?.date_of_birth,
        institution: data_emp?.education_details.slice(-1)[0].institution_name,
        phone: data_emp?.personal_mobile_no,
        comp_payroll: data_emp?.contribution_level,
        role_name: data_emp?.designation_name,
        email: data_emp?.company_email_id,
        degree: data_emp?.education_details.slice(-1)[0].education_category,
        education: data_emp?.education_details.slice(-1)[0].field_of_study,
      });
    } else if (data_ext) {
      reset({
        date_of_birth: data_ext?.date_of_birth,
        date_of_birth_1: dayjs(data_ext?.date_of_birth),
        institution: data_ext?.institution,
        education: data_ext?.education,
        phone: data_ext?.phone,
        email: data_ext?.email,
        gender: data_ext?.gender,
      });
    }
  }, [data_emp, data_ext]);

  const onSubmit = async (values: {
    date_of_birth_1: Dayjs | null;
    institution: string;
    phone: string;
    email: string;
    gender: string;
    education: string;
  }) => {
    console.log(values);
    let payload = {
      name: data_ext?.name,
      date_of_birth: values.date_of_birth_1?.format("YYYY-MM-DD"),
      phone: values.phone,
      institution: values.institution,
      gender: values.gender,
      education: values.education,
    };
    try {
      const { data } = await api.patch("/assessee/profile", payload);
      snack.success("Profile Updated");
      const { data: user_profile }: AxiosResponse<{ message: string; data: ResponseDataEmpExt }> =
        await api.get("/assessee/profile");
      setExternStore(user_profile.data);
      setEditMode(false);
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
    <Card
      sx={theme => ({
        borderRadius: "30px",
        [theme.breakpoints.up("sm")]: {
          width: "30rem",
        },
        [theme.breakpoints.down("sm")]: {
          width: "80%",
        },
      })}
      variant="outlined"
    >
      <Box
        sx={theme => ({
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
          p: 4,
          height: "100%",
        })}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <SettingsToolbar ref={settingsRef} setEditMode={setEditMode} />
        </Box>
        {edit_mode && (
          <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button
              color="secondary"
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
            >
              Save
            </Button>
          </Box>
        )}
        <Avatar
          sx={theme => ({
            [theme.breakpoints.down("sm")]: {
              width: 50,
              height: 50,
            },
            width: 100,
            height: 100,
          })}
        />
        {data_emp && !data_ext && (
          <>
            {data_emp ? (
              <h3 style={{ margin: "0 0 0 0" }}>{data_emp.full_name}</h3>
            ) : (
              <Skeleton variant="text" sx={{ fontSize: "14pt", maxWidth: "15rem" }} />
            )}
            {data_emp ? (
              <p>({id})</p>
            ) : (
              <Skeleton variant="text" sx={{ fontSize: "14pt", maxWidth: "12rem" }} />
            )}
          </>
        )}
        {!data_emp && data_ext && (
          <>
            {data_ext ? (
              <h3 style={{ margin: "0 0 0 0" }}>{data_ext.name}</h3>
            ) : (
              <Skeleton variant="text" sx={{ fontSize: "14pt", maxWidth: "15rem" }} />
            )}
          </>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, width: "100%" }}>
          <TextFieldCtrl
            noMargin
            readOnly
            control={control}
            name="email"
            label="Email"
            size="small"
            sx={{ width: "20rem" }}
          />
          <NumericFieldCtrl
            allowLeadingZeros
            noMargin
            readOnly={!edit_mode && !data_emp}
            control={control}
            name="phone"
            label="Phone Num."
            size="small"
            sx={{ width: "20rem" }}
            rules={{ required: "Please insert this field" }}
          />
          {!data_emp && data_ext && (
            <SelectCtrl
              control={control}
              name="gender"
              label="Gender"
              size="small"
              sx={{ width: "10rem" }}
              readOnly={!edit_mode}
            >
              {Gender.map(value => (
                <MenuItem key={value.value} value={value.value}>
                  {value.label}
                </MenuItem>
              ))}
            </SelectCtrl>
          )}
          {!edit_mode && (data_emp || data_ext) && (
            <TextFieldCtrl
              noMargin
              readOnly
              control={control}
              name="date_of_birth"
              label="Date of Birth"
              size="small"
              sx={{ width: "10rem" }}
            />
          )}
          {edit_mode && !data_emp && data_ext && (
            <DatePickerCtrl
              control={control}
              name="date_of_birth_1"
              label="Date of Birth"
              size="small"
              sx={{ width: "14rem" }}
              format="YYYY-MM-DD"
              rules={{ required: "Please insert this field" }}
            />
          )}
          {data_emp && !data_ext && (
            <TextFieldCtrl
              noMargin
              readOnly
              control={control}
              name="comp_payroll"
              label="Company Payroll"
              size="small"
              sx={{ width: "15rem" }}
            />
          )}

          {data_emp && !data_ext && (
            <TextFieldCtrl
              readOnly
              control={control}
              name="role_name"
              label="Role"
              size="small"
              sx={{ width: "10rem" }}
            />
          )}
          <TextFieldCtrl
            noMargin
            readOnly={!edit_mode && !data_ext}
            control={control}
            name="education"
            label="Education"
            size="small"
            sx={{ width: "20rem" }}
          />
          <TextFieldCtrl
            noMargin
            readOnly={!edit_mode && !data_ext}
            control={control}
            name="institution"
            label="Institution"
            size="small"
            sx={{ width: "20rem" }}
          />
          {data_emp && !data_ext && (
            <TextFieldCtrl
              readOnly
              control={control}
              name="degree"
              label="Degree"
              size="small"
              sx={{ width: "20rem" }}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
}
