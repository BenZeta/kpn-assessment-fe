import "@/index.css";
import { Card, AppBar, Box, Avatar, Skeleton, IconButton } from "@mui/material";
import { Settings } from "@mui/icons-material";
import TextFieldCtrl from "@/components/forms/TextField";
import { useForm } from "react-hook-form";
import useAuthDarwinStore from "@/hooks/useAuthDarwinStore";
import useTokenDarwin from "@/hooks/useTokenDarwin";
import { useEffect, useRef } from "react";
import ListCardOsBatches from "./ListCardOsBatches";
import SettingsToolbar, { SettingsToolbarRef } from "./SettingsToolbar";

export default function BatchesDashboard() {
  const nik = useTokenDarwin(state => state.nik);
  const settingsRef = useRef<SettingsToolbarRef | null>(null);
  const data_emp = useAuthDarwinStore(state => state.darwin_sess);
  const { control, reset } = useForm({
    defaultValues: {
      date_join: "",
      comp_payroll: "",
      role_name: "",
      email: "",
    },
  });

  useEffect(() => {
    reset({
      date_join: data_emp?.date_join,
      comp_payroll: data_emp?.comp_payroll,
      role_name: data_emp?.role_name,
      email: data_emp?.email,
    });
  }, [data_emp]);

  return (
    <Box sx={{ heigth: "100vh", width: "100vw" }}>
      <Box sx={{ width: "100%" }}>
        <AppBar position="static">
          <Box sx={{ px: 2 }}>
            <h3>Assessment</h3>
          </Box>
        </AppBar>
      </Box>
      <Box
        sx={theme => ({
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          height: "100%",
          p: 2,
        })}
        className="client"
      >
        <Card
          sx={theme => ({
            borderRadius: "30px",
            [theme.breakpoints.up("sm")]: {
              width: "30rem",
              height: "80vh",
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
              <SettingsToolbar ref={settingsRef} />
            </Box>
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
            {data_emp ? (
              <h3 style={{ margin: "0 0 0 0" }}>{data_emp.name}</h3>
            ) : (
              <Skeleton variant="text" sx={{ fontSize: "14pt", maxWidth: "15rem" }} />
            )}
            {data_emp ? (
              <p>({nik})</p>
            ) : (
              <Skeleton variant="text" sx={{ fontSize: "14pt", maxWidth: "12rem" }} />
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px", width: "100%" }}>
              <TextFieldCtrl
                readOnly
                control={control}
                name="date_join"
                label="Date of Joining"
                size="small"
                sx={{ width: "10rem" }}
              />
              <TextFieldCtrl
                readOnly
                control={control}
                name="comp_payroll"
                label="Company Payroll"
                size="small"
                sx={{ width: "15rem" }}
              />
              <TextFieldCtrl
                readOnly
                control={control}
                name="role_name"
                label="Role"
                size="small"
                sx={{ width: "10rem" }}
              />
              <TextFieldCtrl
                readOnly
                control={control}
                name="email"
                label="Email"
                size="small"
                sx={{ width: "20rem" }}
              />
            </Box>
          </Box>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            m: 2,
            borderRadius: "30px",
            p: 2,
            gap: 2,
            height: "75vh",
            overflowY: "scroll",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              gap: 3,
            }}
          >
            <ListCardOsBatches />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
