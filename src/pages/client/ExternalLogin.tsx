import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import logo from "../../assets/kpn-logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import TextFieldCtrl from "@/components/forms/TextField";

const ExternalLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  // };

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
                }}
              >
                ASSESMENT
              </Typography>
            </Box>

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

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  New password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  onChange={e => setPassword(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "#fff" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Confirm new password
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="••••••••"
                  onChange={e => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: "#fff",
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
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
                Login
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
  );
};

export default ExternalLogin;
