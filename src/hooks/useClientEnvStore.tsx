import { create } from "zustand";

const AllowedBrowser = ["Chrome"];

export type ClientEnvStore = {
  brwsr_app: string;
  allowed: boolean;
};

export interface ClientEnvStoreInterface extends ClientEnvStore {
  setClientEnv: ({ brwsr_app }: { brwsr_app: string }) => void;
}

const useClientEnvStore = create<ClientEnvStoreInterface>((set, get) => ({
  brwsr_app: "",
  allowed: false,
  setClientEnv: value => {
    const isAllowed = AllowedBrowser.some(val => {
      return val.toLowerCase().includes(value.brwsr_app.split(" ")[0].toLowerCase());
    });
    set({ allowed: isAllowed, ...value });
  },
}));

export default useClientEnvStore;
