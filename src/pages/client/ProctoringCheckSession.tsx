import { Card, Container, Box, Button } from "@mui/material";
import useScreenShareStore from "@/hooks/useScreenShareStore";
import useWebCamCheck from "@/hooks/useWebcamCheck";
import useScreenCheck from "@/hooks/useScreenCheck";
import ProctoringWebcamCheck from "./ProctoringWebcamCheck";
import ProctoringScreenCheck from "./ProctoringScreenCheck";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

export default function ProctoringCheckSession() {
  const setScreenStream = useScreenShareStore(state => state.setScreenStream);
  const setAllowWebCam = useWebCamCheck(state => state.setAllowWebCam);
  const allowWebCam = useWebCamCheck(state => state.allowWebcam);
  const setAllowScreen = useScreenCheck(state => state.setAllowScreen);
  const navigate = useNavigate();
  const { id, token } = useParams();

  useEffect(() => {
    console.log(navigator.userAgent);
  }, []);

  return (
    <Container sx={{ height: "100vh" }}>
      <Card sx={{ width: "100%", height: "100%" }}>
        <Box
          sx={{
            height: "90%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>Proctoring Checking</h2>
          <Box sx={{ display: "flex", gap: 3 }}>
            <ProctoringScreenCheck setAllowed={setAllowScreen} />
            <ProctoringWebcamCheck setAllowed={setAllowWebCam} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", px: 4, mt: 15 }}>
            <Button
              variant="contained"
              onClick={() => {
                navigate(`/client/assessment/${token}/subtest/${id}`);
              }}
            >
              Start
            </Button>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}
