import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
import TextFieldCtrl from "../components/forms/TextField";
import { useForm } from "react-hook-form";
import { PasswordWithEye } from "../components/forms/PasswordWithEye";
import { Link, useNavigate } from "react-router-dom";
import { useLoading } from "@/providers/LoadingProvider";
import { snack } from "@/providers/SnackbarProvider";
import { isAxiosError } from "axios";
import useAuthStore from "@/hooks/useAuthStore";
import { Auth } from "@/types/AuthAdmin";
import useAPI from "@/hooks/useAPI";
import AuthLayout from "@/components/AuthLayout";

interface LoginValues {
  username: string;
  password: string;
}

const AdminLogin = () => {
  const API = useAPI();
  const setAuth = useAuthStore((state: Auth) => state.setAuth);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { control, handleSubmit } = useForm<LoginValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLogin = async (values: LoginValues) => {
    console.log(values);
    showLoading();
    try {
      const res = await API.post(`/admin/login`, values);
      console.log(res.data.data);
      setAuth(res.data.data);
      snack.success(`${res.data.message}`);
      navigate("/admin");
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

  return (
    <AuthLayout>
      <Typography variant="h1" color="primary">
        Admin Login
      </Typography>
      <Typography variant="h2">KPN Assessment</Typography>
      <Box component="form" onSubmit={handleSubmit(onLogin)}>
        <TextFieldCtrl
          control={control}
          name="username"
          label="Username/Email"
          rules={{
            required: "Field required",
            validate: (value: any) => !/\s/.test(value) || "Field cannot contain white spaces",
          }}
        />
        <PasswordWithEye
          control={control}
          name="password"
          label="Password"
          rules={{
            required: "Field required",
            validate: (value: any) => !/\s/.test(value) || "Field cannot contain white spaces",
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ textAlign: "right" }}>
          <Button variant="contained" type="submit">
            Login
          </Button>
        </Box>
      </Box>
      <Box>
        <MuiLink component={Link} to="/reset-pass">
          Reset Password
        </MuiLink>
      </Box>
    </AuthLayout>
  );
};
export default AdminLogin;
