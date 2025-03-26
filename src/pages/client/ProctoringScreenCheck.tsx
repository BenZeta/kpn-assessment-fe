import { ReactMediaRecorder } from "react-media-recorder";
import useScreenShareStore from "@/hooks/useScreenShareStore";
import { useEffect, useRef, useState } from "react";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DialogNotWantedScreenShare from "./DialogNotWantedScreenShare";
import { Check, Close } from "@mui/icons-material";

const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
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

export default function ProctoringScreenCheck({
  setAllowed,
}: {
  setAllowed: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const setScreenStream = useScreenShareStore(state => state.setScreenStream);
  const screen_stream = useScreenShareStore(state => state.screen_stream);
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <ReactMediaRecorder
      screen={true}
      render={({ status, startRecording, stopRecording, previewStream }) => {
        const [track, setTrack] = useState<MediaStreamTrack | null>(null);
        useEffect(() => {
          (async () => {
            if (status == "recording" && previewStream) {
              setAllowed(true);
              setScreenStream(previewStream);
            } else {
              setAllowed(false);
            }
          })();
        }, [status]);
        useEffect(() => {
          if (previewStream && screen_stream) {
            const track = screen_stream?.getVideoTracks()[0];
            if (!track.label.match("screen") && !openDialog && screen_stream.active) {
              stopRecording();
              setScreenStream(null);
              console.log("open dialog");
              setOpenDialog(true);
            }
            if (track) {
              track.onended = () => {
                setScreenStream(null);
              };
            }
          }
        }, [previewStream, screen_stream]);
        useEffect(() => {
          console.log(previewStream);
          if (previewStream && !screen_stream && previewStream.active) {
            setScreenStream(previewStream);
          }
        }, [previewStream, screen_stream]);
        console.log(screen_stream);
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <VideoPreview stream={screen_stream} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {screen_stream ? (
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
                startRecording();
              }}
              size="small"
              variant="contained"
            >
              Check Screen Share
            </Button>
            <DialogNotWantedScreenShare open={openDialog} setOpen={setOpenDialog} />
          </Box>
        );
      }}
    />
  );
}
