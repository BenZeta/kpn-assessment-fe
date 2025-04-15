import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenDarwin = {
  token_drw: string;
  nik: string;
  setTokenDrw: ({ token, nik }: { token: string; nik: string }) => void;
  resetToken: () => void;
};

const useTokenDarwin = create<TokenDarwin>()(
  persist(
    set => ({
      token_drw: "",
      nik: "",
      setTokenDrw: ({ token, nik }) => set({ token_drw: token, nik: nik }),
      resetToken: () => set({ token_drw: "", nik: "" }),
    }),
    { name: "token_darwin" }
  )
);

export default useTokenDarwin;
