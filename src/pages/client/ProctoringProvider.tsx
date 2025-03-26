// Removed incorrect import of File from "buffer"
import { useContext, createContext, useEffect, useRef, useState, ReactNode } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import { ChevronLeft, ChevronRight, ScreenRotationAlt } from "@mui/icons-material";
import useWebcamStore from "@/hooks/useWebcamStore";
import useScreenShareStore from "@/hooks/useScreenShareStore";
import { useNavigate, useParams } from "react-router-dom";

const VideoProctoringContext = createContext<{
  status_active: boolean;
  image_captured: File | null;
}>({
  status_active: false,
  image_captured: null,
});

const VideoPreview = ({
  stream,
  setImageSrc,
  user_id,
  canvasRef,
  hide,
  setHide,
}: {
  stream: MediaStream | null;
  setImageSrc: (value: File) => void;
  user_id: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hide: boolean;
  setHide: (value: boolean | ((x: boolean) => boolean)) => void;
}) => {
  function dataURItoBlob(dataURI: string, user_id: string) {
    var byteString = atob(dataURI.split(",")[1]);

    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], `prctr_${user_id}`);
  }
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRefPos = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const mediaQuery = useMediaQuery(theme => theme.breakpoints.down("lg"));
  useEffect(() => {
    if (videoRef.current && stream) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = stream;

        buttonRefPos.current.width = videoRef.current.clientWidth;
        buttonRefPos.current.height = videoRef.current.clientHeight;
      }
    }
  }, [stream]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (canvasRef.current === null) {
        return;
      }
      canvasRef.current.width = videoRef.current?.videoWidth || 100;
      canvasRef.current.height = videoRef.current?.videoHeight || 100;
      if (videoRef.current) {
        canvasRef.current.getContext("2d")?.drawImage(videoRef.current, 0, 0);
        const image = canvasRef.current.toDataURL("image/png");
        const File = dataURItoBlob(image, user_id);
        console.log(File);
        setImageSrc(File);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [stream]);

  useEffect(() => {
    if (mediaQuery) {
      setHide(true);
    }
  }, [mediaQuery]);

  if (!stream) {
    return null;
  }
  return (
    <>
      <Box
        sx={theme => ({
          position: "fixed",
          top: "100px",
          right: 0,
          width: "fit-content",
          display: hide ? "none" : "",
        })}
      >
        <video
          style={{
            width: "13rem",
            height: "10rem",
            borderRadius: "0 0 0 20px",
          }}
          ref={videoRef}
          width={1200}
          height={720}
          autoPlay
        />
      </Box>
      {videoRef.current && (
        <IconButton
          sx={theme => ({
            position: "fixed",
            top: "100px",
            right: hide ? -10 : (buttonRefPos.current?.width || 100) - 20,
            zIndex: 1,
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
          })}
          onClick={() => setHide(prev => !prev)}
        >
          {hide ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      )}
    </>
  );
};

export default function ProctoringProvider({ children }: { children: ReactNode }) {
  const [imageSrc, setImageSrc] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(document.createElement("canvas"));
  const [hide, setHide] = useState(false);
  const webcam_stream = useWebcamStore(state => state.webcam_stream);
  const screen_stream = useScreenShareStore(state => state.screen_stream);
  const navigate = useNavigate();
  const { token, id } = useParams();

  useEffect(() => {
    console.log(webcam_stream);
    console.log(screen_stream);
    if (!(webcam_stream && screen_stream)) {
      navigate(`/client/assessment/${token}/subtest/${id}/proctor`);
    }
  }, [webcam_stream, screen_stream]);
  return (
    <VideoProctoringContext.Provider value={{ status_active: true, image_captured: imageSrc }}>
      <ReactMediaRecorder
        video
        render={({ startRecording, previewStream }) => {
          useEffect(() => {
            if (!webcam_stream) startRecording();
          }, []);
          return (
            <VideoPreview
              stream={webcam_stream ?? previewStream}
              setImageSrc={setImageSrc}
              user_id={""}
              canvasRef={canvasRef}
              hide={hide}
              setHide={setHide}
            />
          );
        }}
      />

      {children}
    </VideoProctoringContext.Provider>
  );
}

export const useProctoring = () => useContext(VideoProctoringContext);
