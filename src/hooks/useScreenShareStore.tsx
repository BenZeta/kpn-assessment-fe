import { create } from "zustand";

interface ScreenShareStore {
  screen_stream: MediaStream | null;
  setScreenStream: (value: MediaStream | null) => void;
}

const useScreenShareStore = create<ScreenShareStore>(set => ({
  screen_stream: null,
  setScreenStream: value =>
    set({
      screen_stream: value,
    }),
}));

export default useScreenShareStore;
