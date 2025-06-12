import { create } from "zustand";

export type DarwinStore = {
  name: string;
  date_join: string;
  comp_payroll: string;
  role_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  personal_mobile_no: string;
  education_details: {
    institution_name: string;
    education_category: string;
    field_of_study: string;
  }[];
};

interface AuthDarwinStore {
  darwin_sess: DarwinStore | null;
  setDarwinStore: (value: DarwinStore) => void;
}

const useAuthDarwinStore = create<AuthDarwinStore>(set => ({
  darwin_sess: null,
  setDarwinStore: value => set({ darwin_sess: value }),
}));

export default useAuthDarwinStore;
