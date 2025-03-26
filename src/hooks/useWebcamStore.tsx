import { create } from "zustand";

interface WebcamStore {
  webcam_stream: MediaStream | null;
  setWebcamStream: (value: MediaStream) => void;
}

const useWebcamStore = create<WebcamStore>(set => ({
  webcam_stream: null,
  setWebcamStream: value => set({ webcam_stream: value }),
}));

export default useWebcamStore;
