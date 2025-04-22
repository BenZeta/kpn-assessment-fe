import { create } from "zustand";

interface useQNAIdentityStoreInterface {
  batch_id: string;
  setIdentity: ({ batch_id }: { batch_id: string }) => void;
}

const useQNAIdentityStore = create<useQNAIdentityStoreInterface>(set => ({
  batch_id: "",
  setIdentity: ({ batch_id }) => {
    set({ batch_id });
  },
}));

export default useQNAIdentityStore;
