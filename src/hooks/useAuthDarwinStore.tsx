import { create } from "zustand";

type DarwinStore = {
  name: string;
  date_join: string;
  comp_payroll: string;
  role_name: string;
  email: string;
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
