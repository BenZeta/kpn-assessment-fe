import DialogFormConfirmation, {
  RefDialogConfirmation,
} from "@/components/common/DialogFormConfirmation";
import useAPI from "@/hooks/useAPIDarwin";
import useClientEnvStore from "@/hooks/useClientEnvStore";
import useScreenCheck from "@/hooks/useScreenCheck";
import useWebCamCheck from "@/hooks/useWebcamCheck";
import { snack } from "@/providers/SnackbarProvider";
import { Check, Close } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { AxiosResponse, isAxiosError } from "axios";
import { Detector } from "detector-js";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProctoringScreenCheck from "./ProctoringScreenCheck";
import ProctoringWebcamCheck from "./ProctoringWebcamCheck";

export default function ProctoringCheckSession() {
  const api = useAPI();
  const setAllowWebCam = useWebCamCheck(state => state.setAllowWebCam);
  const allowWebCam = useWebCamCheck(state => state.allowWebcam);
  const setAllowScreen = useScreenCheck(state => state.setAllowScreen);
  const allowScreen = useScreenCheck(state => state.allowScreen);
  const navigate = useNavigate();
  const { id, token } = useParams();
  const refDialog = useRef<RefDialogConfirmation | null>(null);

  const setClientEnv = useClientEnvStore(state => state.setClientEnv);
  const brwsr_app = useClientEnvStore(state => state.brwsr_app);
  const allowed = useClientEnvStore(state => state.allowed);
  const detector = new Detector();

  useEffect(() => {
    if (brwsr_app == "") {
      const browser = detector.browser as unknown as { name: string; version: string };
      setClientEnv({ brwsr_app: `${browser.name} (${browser.version})` });
    }
  }, []);

  const onYes = async () => {
    try {
      const { data }: AxiosResponse<{ example_taken: boolean }> = await api.get(
        `/assessment/test/subtest/header/${id}`
      );
      if (!data.example_taken) {
        navigate(`/client/assessment/${token}/example/subtest/${id}/`);
      } else {
        navigate(`/client/assessment/${token}/subtest/${id}`);
      }
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        snack.error(error.response?.data.message);
      }
    }
  };

  return (
    <Container sx={{ height: "100vh" }}>
      <Card sx={{ width: "100%", height: "100%" }}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>Proctoring Checking</h2>
          <Alert severity="warning" sx={{ width: "40rem" }}>
            <strong>
              When "Screen Share" pop up appears, please choose "Entire Screen" to proceed test.
              Make sure you are not connected to another screen
            </strong>
          </Alert>
          <Box sx={{ display: "flex", gap: 3 }}>
            <ProctoringScreenCheck setAllowed={setAllowScreen} />
            <ProctoringWebcamCheck setAllowed={setAllowWebCam} />
          </Box>
          <Box sx={{ display: "flex" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Requirement</TableCell>
                  <TableCell>Current</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Browser</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {brwsr_app}{" "}
                      {allowed ? (
                        <Check sx={theme => ({ color: theme.palette.success.main })} />
                      ) : (
                        <Close sx={theme => ({ color: theme.palette.error.main })} />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", px: 4 }}>
            <Button
              variant="contained"
              onClick={async () => {
                if (refDialog.current) {
                  let is_webcam = allowWebCam;
                  console.log("screen : ", allowScreen);
                  console.log("webcam : ", is_webcam);
                  console.log("device : ", allowed);
                  if (allowScreen && allowWebCam && allowed) {
                    refDialog.current.setOpen(true);
                  } else {
                    snack.error("Please make sure every proctoring requirement is allowed");
                  }
                }
              }}
            >
              Start
            </Button>
          </Box>
        </Box>
      </Card>
      <DialogFormConfirmation
        ref={refDialog}
        Content={
          <Box sx={{ p: 4 }}>
            <h3>Are you sure want to continue?</h3>
          </Box>
        }
        onYes={onYes}
      />
    </Container>
  );
}
