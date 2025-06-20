import { Box, Button, Container, IconButton, MenuItem, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";
import CheckboxCtrl from "@/components/forms/Checkbox";
import SelectCtrl from "@/components/forms/Select";
import useFetch from "@/hooks/useFetch";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import useAPI from "@/hooks/useAPI";
import { useEffect } from "react";
import { TableSkeleton } from "@/components/Skeleton";

const CreateAdmin = () => {
  const API = useAPI();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { data: role } = useFetch<any>("/admin/role");
  const { data: adminData, loading } = useFetch<any>(id ? `/admin/${id}` : null);

  const isEditMode = !!id;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      is_active: true,
      role_id: "",
      created_by: "",
    },
  });

  useEffect(() => {
    if (adminData?.data && isEditMode) {
      reset({
        username: adminData.data.username || "",
        fullname: adminData.data.fullname || "",
        email: adminData.data.email || "",
        is_active: adminData.data.is_active ?? true,
        role_id: adminData.data.role_id || "",
        created_by: adminData.data.created_by || "",
      });
    }
  }, [adminData, isEditMode, reset]);


  const onSubmit = async (values: any) => {
    console.log(values);
    showLoading();
    try {
      const endpoint = isEditMode ? `/admin/${id}` : `/admin`;
      const method = isEditMode ? "patch" : "post";
      const res = await API[method](endpoint, values);
      snack.success(`${res.data.message}`);
      navigate("/admin/accounts");
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        snack.error(data.message);
        console.error(error.response);
      } else {
        snack.error("Error, check log for details");
        console.error(error);
      }
    } finally {
      hideLoading();
    }
  };

  if (loading) {
    <Container maxWidth="sm">
      <TableSkeleton column={4} row={2} small />
    </Container>;
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" color="primary" mb={0}>
          {isEditMode ? "Edit Admin" : "New Admin"}
        </Typography>
      </Box>

      <Container maxWidth="sm">
        <TextFieldCtrl
          control={control}
          name="username"
          label="Username"
          readOnly={isEditMode}
          rules={{
            required: "This field is required",
          }}
        />
        <TextFieldCtrl
          control={control}
          name="fullname"
          label="Full Name"
          rules={{
            required: "This field is required",
          }}
        />
        <TextFieldCtrl
          control={control}
          name="email"
          label="Email"
          readOnly={isEditMode}
          rules={{
            required: "This field is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "invalid email address",
            },
          }}
        />
        <SelectCtrl
          name="role_id"
          label="Role"
          control={control}
          rules={{
            required: "This field is required",
          }}
        >
          {role ? (
            role.data.map((data: any) => (
              <MenuItem key={data.id} value={data.id}>
                {data.role_name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              Loading...
            </MenuItem>
          )}
        </SelectCtrl>
        <CheckboxCtrl name="is_active" control={control} label="Active" noMargin  disabled={isEditMode} />
        <Box sx={{ textAlign: "right" }}>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </Box>
      </Container>
    </>
  );
};
export default CreateAdmin;
