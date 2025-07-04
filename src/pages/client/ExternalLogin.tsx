import PasswordWithEyev2 from "@/components/forms/PasswordWithEyev2";
import TextFieldCtrl from "@/components/forms/TextField";
import useAPI from "@/hooks/useAPIAssesse";
import useTokenAssessee from "@/hooks/useTokenAssessee";
import useTokenExternal from "@/hooks/useTokenExternal";
import { snack } from "@/providers/SnackbarProvider";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import { AxiosResponse, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/kpn-logo.png";
import { DecodedToken } from "./RedirectPage";
import assessment_logo from "@/assets/assessment.png";

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
  const setTokenExt = useTokenExternal(state => state.setTokenExt);
  const setTokenAs = useTokenAssessee(state => state.setTokenAss);
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
          setTokenAs({ token: result_login?.data.access_token, type: "external" });
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
          if (decoded_tok.type == "internal") {
            setIsReg(true);
            reset({
              name: "",
              email: "",
              new_password: "",
              confirm_password: "",
              password: "",
            });
            return;
          }
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
                  mb: 0,
                }}
              >
                ASSESSMENT
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
                      position: "relative",
                      "&:hover": {
                        textDecoration: "underline",
                        bgcolor: "transparent",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: "-105px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "100px",
                          height: "100px",
                          backgroundImage: `url(${assessment_logo})`,
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          zIndex: 1000,
                          animation: "fadeInScale 0.3s ease-in-out",
                        },
                        "&::before": {
                          content: '"ASSESSMENT (DEV)"',
                          position: "absolute",
                          top: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#d94560",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          zIndex: 1001,
                          animation: "fadeInScale 0.3s ease-in-out",
                          whiteSpace: "nowrap",
                        },
                      },
                      "@keyframes fadeInScale": {
                        "0%": {
                          opacity: 0,
                          transform: "translateX(-50%) scale(0.5)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateX(-50%) scale(1)",
                        },
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
  );
};

export default ExternalLogin;
