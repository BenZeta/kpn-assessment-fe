import { ResponseDataEmpExt } from "@/types/AssessmentTypes";
import { create } from "zustand";

type ExternStore = ResponseDataEmpExt;

interface AuthExternStore {
  ext_sess: ExternStore | null;
  setExternStore: (value: ExternStore) => void;
}

const useAuthExternStore = create<AuthExternStore>(set => ({
  ext_sess: null,
  setExternStore: value => set({ ext_sess: value }),
}));

export default useAuthExternStore;
