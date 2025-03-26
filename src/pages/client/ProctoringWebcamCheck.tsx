import { ReactMediaRecorder } from "react-media-recorder";
import { useEffect, useRef } from "react";
import useWebcamStore from "@/hooks/useWebcamStore";
import { Box, Button } from "@mui/material";
import { Check, Close } from "@mui/icons-material";

const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);
  return (
    <video
      style={{
        width: "13rem",
        height: "10rem",
      }}
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
  const setWebcamStream = useWebcamStore(state => state.setWebcamStream);
  return (
    <ReactMediaRecorder
      video
      render={({ startRecording, previewStream }) => {
        useEffect(() => {
          (async () => {
            const allowed = await navigator.permissions.query({ name: "camera" });
            console.log(allowed.state);
            if (allowed.state == "granted") {
              startRecording();
              setAllowed(true);
            } else {
              startRecording();
              setAllowed(false);
            }
          })();
        }, []);
        useEffect(() => {
          if (previewStream && !webcam_stream) {
            setWebcamStream(previewStream);
          }
        }, [previewStream]);
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <VideoPreview stream={webcam_stream && previewStream} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {webcam_stream ? (
                <>
                  <h4>Passed</h4>
                  <Check />
                </>
              ) : (
                <>
                  <h4>Denied</h4>
                  <Close />
                </>
              )}
            </Box>
            <Button
              onClick={() => {
                navigator.permissions.query({ name: "camera" });
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
