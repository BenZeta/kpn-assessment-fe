import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenExternal = {
  token_ext: string;
  setTokenExt: ({ token }: { token: string }) => void;
  resetTokenExt: () => void;
};

const useTokenExternal = create<TokenExternal>()(
  persist(
    set => ({
      token_ext: "",
      setTokenExt: ({ token }) => set({ token_ext: token }),
      resetTokenExt: () => set({ token_ext: "" }),
    }),
    { name: "token_ext" }
  )
);

export default useTokenExternal;
