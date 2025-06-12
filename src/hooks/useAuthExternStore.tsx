import { ResponseDataEmpExt } from "@/types/AssessmentTypes";
import { create } from "zustand";

type ExternStore = ResponseDataEmpExt;

interface AuthExternStore {
  ext_sess: ExternStore | null;
  is_complete: boolean;
  setExternStore: (value: ExternStore) => void;
}

const useAuthExternStore = create<AuthExternStore>(set => ({
  ext_sess: null,
  is_complete: false,
  setExternStore: value => {
    let is_complete = true;
    if (!value.phone || !value.date_of_birth || (!value.education || !value.education_details.slice(-1)[0].field_of_study)) {
      is_complete = false;
    }
    set({ ext_sess: value, is_complete: is_complete });
  },
}));

export default useAuthExternStore;
