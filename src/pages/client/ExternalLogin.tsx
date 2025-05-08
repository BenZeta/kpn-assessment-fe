import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import logo from "../../assets/kpn-logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";
import useAPI from "@/hooks/useAPIDarwin";
import { AxiosResponse, isAxiosError } from "axios";
import { DecodedToken } from "./RedirectPage";
import PasswordWithEyev2 from "@/components/forms/PasswordWithEyev2";
import { Alert } from "@mui/material";
import { SnackbarProvider, snack } from "@/providers/SnackbarProvider";
import useTokenExternal from "@/hooks/useTokenExternal";
import { useNavigate } from "react-router-dom";

interface ExtLoginFormInt {
  email: string;
  password: string;
  new_password: string;
  confirm_password: string;
  name: string;
}

const ExternalLogin: React.FC = () => {
  const api = useAPI();
  const [is_registered, setIsReg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setTokenExt = useTokenExternal(state => state.setTokenExt);
  const navigate = useNavigate();
  const { token } = useParams();
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<ExtLoginFormInt>({
    defaultValues: {
      email: "",
      password: "",
      new_password: "",
      confirm_password: "",
      name: "",
    },
  });

  const register = async (values: { name: string; email: string; new_password: string }) => {
    try {
      const { data } = await api.post("/assessee/registration", values);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const login = async (values: { email: string; password: string }) => {
    try {
      const { data }: AxiosResponse<{ message: string; data: { access_token: string } }> =
        await api.post("/assessee/login", values);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const submitLogin = async (values: ExtLoginFormInt) => {
    console.log(values);
    try {
      if (is_registered) {
        let payload_login = { email: values.email, password: values.password };
        const result_login = await login(payload_login);
        if (result_login) {
          setTokenExt({ token: result_login?.data.access_token });
          snack.success("Success Login");
          const timeout = setTimeout(() => {
            let nextnavi = "/client";
            if (token) {
              nextnavi += `/${token}`;
            } else {
              nextnavi += `/dashboard`;
            }
            navigate(nextnavi);
          }, 1000);
        } else {
          throw new Error("Error");
        }
      } else {
        let payload_register = {
          name: values.name,
          email: values.email,
          new_password: values.new_password,
        };
        const result_register = await register(payload_register);
        snack.success("Success Registered");
        setIsReg(true);
        reset({
          email: values.email,
          name: "",
          password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      } else {
        snack.error((error as Error).message);
      }
    }
  };

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const { data: decoded_tok }: AxiosResponse<DecodedToken> = await api.get(
            `/assessee/${token}`
          );
          const { data: check_user }: AxiosResponse<{ is_exist: boolean; data: { name: string } }> =
            await api.get(`/assessee/isreg/${decoded_tok.email}`);
          setIsReg(check_user.is_exist);
          reset({
            name: check_user.data.name,
            email: decoded_tok.email,
            new_password: "",
            confirm_password: "",
            password: "",
          });
        } catch (error) {
          console.error(error);
        }
      })();
    } else {
      setIsReg(true);
    }
  }, []);

  console.log(errors);
  return (
    <SnackbarProvider>
      <Box sx={{ bgcolor: "#e8f0f7", minHeight: "100vh", pt: 4, pb: 4 }}>
        <Container maxWidth="sm">
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              overflow: "hidden",
              pt: 3,
              pb: 3,
            }}
          >
            <Box
              sx={{
                maxWidth: 550,
                mx: "auto",
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 5 }}>
                <Box component="img" src={logo} alt="Assessment Logo" sx={{ height: 40, mr: 2 }} />
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  ASSESMENT
                </Typography>
              </Box>
              {!is_registered && (
                <Alert severity="info" sx={{ my: 1 }}>
                  <strong>You are not registered to Assessment App, please sign up</strong>
                </Alert>
              )}

              <Box component="form" onSubmit={() => {}} sx={{ width: "100%" }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextFieldCtrl
                    control={control}
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    size="small"
                    sx={{ bgcolor: "#fff", mb: 0 }}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    }}
                  />
                </Box>

                {!is_registered && (
                  <>
                    <PasswordWithEyev2 control={control} name="new_password" label="New Password" />
                    <PasswordWithEyev2
                      control={control}
                      rules={{
                        validate: value =>
                          value !== getValues("new_password") ? "Password not match" : true,
                      }}
                      name="confirm_password"
                      label="Confirm Password"
                    />
                  </>
                )}

                {is_registered && (
                  <>
                    <PasswordWithEyev2 control={control} name="password" label="Password" />
                  </>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isSubmitting}
                  onClick={handleSubmit(submitLogin)}
                  sx={{
                    py: 1.5,
                    bgcolor: "#d94560",
                    "&:hover": {
                      bgcolor: "#c03651",
                    },
                    textTransform: "none",
                    borderRadius: "4px",
                    boxShadow: "none",
                  }}
                >
                  {is_registered ? "Login" : "Sign Up"}
                </Button>
                <Box>
                  <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                    Are you an Internal Employee?
                    <Button
                      variant="text"
                      onClick={() => {
                        window.location.href = `https://kpncorporation.darwinbox.com/user/login`;
                      }}
                      sx={{
                        textTransform: "none",
                        color: "#d94560",
                        fontWeight: 500,
                        padding: 0,
                        ml: 1,
                        "&:hover": {
                          textDecoration: "underline",
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      Click here
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </SnackbarProvider>
  );
};

export default ExternalLogin;
