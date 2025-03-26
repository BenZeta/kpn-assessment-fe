import { create } from "zustand";

interface ScreenCheck {
  allowScreen: boolean;
  setAllowScreen: (value: boolean) => void;
}

const useScreenCheck = create<ScreenCheck>(set => ({
  allowScreen: false,
  setAllowScreen: value => set({ allowScreen: value }),
}));

export default useScreenCheck;
