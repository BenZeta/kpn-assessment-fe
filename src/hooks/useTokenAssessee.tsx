import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenAssessee = {
  token_as: string;
  type: string;
  setTokenAss: ({ token, type }: { token: string; type: string }) => void;
  resetTokenAss: () => void;
};

const useTokenAssessee = create<TokenAssessee>()(
  persist(
    set => ({
      token_as: "",
      type: "",
      setTokenAss: ({ token, type }) => set({ token_as: token, type: type }),
      resetTokenAss: () => set({ token_as: "", type: "" }),
    }),
    { name: "token_as" }
  )
);

export default useTokenAssessee;
