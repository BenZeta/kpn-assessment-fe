import { ReactMediaRecorder } from "react-media-recorder";
import { useEffect, useRef, useState } from "react";
import useWebcamStore from "@/hooks/useWebcamStore";
import { Box, Button } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { snack } from "@/providers/SnackbarProvider";
import useWebCamCheck from "@/hooks/useWebcamCheck";

const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return (
    <video
      style={{ width: "13rem", height: "10rem" }}
      ref={videoRef}
      width={1200}
      height={720}
      autoPlay
    />
  );
};

export default function ProctoringWebcamCheck({
  setAllowed,
}: {
  setAllowed: (value: boolean) => void;
}) {
  const webcam_stream = useWebcamStore(state => state.webcam_stream);
  const allow_webcam = useWebCamCheck(state => state.allowWebcam);
  const setWebcamStream = useWebcamStore(state => state.setWebcamStream);
  const [cameraDisabled, setCameraDisabled] = useState(false);
  // Handle re-check button press
  return (
    <ReactMediaRecorder
      video
      render={({ startRecording, previewStream }) => {
        // Setup permission check + recording logic
        useEffect(() => {
          let mounted = true;

          navigator.permissions
            .query({ name: "camera" as PermissionName })
            .then(permissionStatus => {
              const granted = permissionStatus.state === "granted";
              // console.log(permissionStatus.state);
              setAllowed(granted);

              if (granted && mounted) {
                startRecording();
              }

              permissionStatus.onchange = () => {
                const isGranted = permissionStatus.state === "granted";
                // setAllowed(isGranted);
                if (isGranted && mounted) {
                  startRecording();
                }
              };
            })
            .catch(error => {
              console.error("Permission error:", error);
              setAllowed(false);
            });

          return () => {
            mounted = false;
          };
        }, []);

        // Set webcam stream once
        useEffect(() => {
          console.log("setting webcam global var");
          if (previewStream && !webcam_stream) {
            setWebcamStream(previewStream);
            setAllowed(true);
          }
        }, [previewStream, webcam_stream, setWebcamStream]);

        useEffect(() => {
          // console.log(webcam_stream);
          // console.log(allow_webcam);
          if (!allow_webcam) {
            return;
          }
          if (!previewStream && allow_webcam) {
            snack.error(
              "Something wrong with camera, please enable camera and refresh your browser "
            );
            setAllowed(false);
            setWebcamStream(null);
            setCameraDisabled(true);
          }
        }, [previewStream, allow_webcam]);

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <VideoPreview stream={webcam_stream && previewStream} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {webcam_stream ? (
                <>
                  <h4>Passed</h4>
                  <Check sx={theme => ({ color: theme.palette.success.main })} />
                </>
              ) : (
                <>
                  <h4>Denied</h4>
                  <Close sx={theme => ({ color: theme.palette.error.main })} />
                </>
              )}
            </Box>
            <Button
              onClick={() => {
                console.log(cameraDisabled);
                if (cameraDisabled) {
                  snack.error(
                    "Something wrong with camera, please enable camera and refresh your browser "
                  );
                }
                setWebcamStream(null); // reset
                // setChecking(true);
                navigator.permissions
                  .query({ name: "camera" as PermissionName })
                  .then(permissionStatus => {
                    const granted = permissionStatus.state === "granted";
                    // console.log(permissionStatus.state);
                    // console.log("granted");
                    setAllowed(granted);
                    if (granted) {
                      startRecording();
                    }
                  });
                startRecording();
              }}
              size="small"
              variant="contained"
            >
              Check Webcam
            </Button>
          </Box>
        );
      }}
    />
  );
}
