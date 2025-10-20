import PasswordWithEyev2 from "@/components/forms/PasswordWithEyev2";
import TextFieldCtrl from "@/components/forms/TextField";
import { Box, Button, Container, Typography } from "@mui/material";
import logo from "../../assets/kpn-logo.png";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { snack } from "@/providers/SnackbarProvider";
import { API } from "@/utils/api";
import { AxiosResponse, isAxiosError } from "axios";

export default function ResetPassClient() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { token } = useParams();
  useEffect(() => {
    (async () => {
      try {
        if (!token) {
          snack.error("Token not provided");
          // return;
          const timeout = setTimeout(() => {
            navigate("/login/client");
          }, 2000);
          return () => {
            clearTimeout(timeout);
          };
        }
        const {
          data,
        }: AxiosResponse<{
          data: {
            email: string;
            name: string;
          };
        }> = await API.get("/extern/veriftokenres", {
          headers: { Authorization: `Bearer ${token}` },
        });
        reset({
          email: data.data.email,
          password: "",
        });
      } catch (error) {
        if (isAxiosError(error)) {
          snack.error(error.response?.data.message);
          const timeout = setTimeout(() => {
            navigate("/login/client");
          }, 2000);
          return () => {
            clearTimeout(timeout);
          };
        } else {
          snack.error((error as Error).message, true);
        }
      }
    })();
  }, [token]);

  const submitReset = async (value: { email: string; password: string }) => {
    try {
      const {
        data,
      }: AxiosResponse<{
        message: string;
      }> = await API.post(
        "/extern/resettoken",
        {
          password: value.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      snack.success(data.message);
      navigate("/login/client");
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error?.response?.data.message);
        const timeout = setTimeout(() => {
          navigate("/login/client");
        }, 2000);
        return () => {
          clearTimeout(timeout);
        };
      } else {
        snack.error((error as Error).message, true);
      }
    }
  };
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
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.5px",
                mb: 0,
              }}
            >
              Reset Password Assessee
            </Typography>

            <Box component="form" onSubmit={() => {}} sx={{ width: "100%" }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextFieldCtrl
                  disabled
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

              <PasswordWithEyev2 control={control} name="password" label="Password" />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                loading={isSubmitting}
                onClick={handleSubmit(submitReset)}
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
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
