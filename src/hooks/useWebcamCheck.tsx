import { create } from "zustand";

interface WebCamCheck {
  allowWebcam: boolean;
  setAllowWebCam: (value: boolean) => void;
}

const useWebCamCheck = create<WebCamCheck>(set => ({
  allowWebcam: false,
  setAllowWebCam: value => set({ allowWebcam: value }),
}));

export default useWebCamCheck;
