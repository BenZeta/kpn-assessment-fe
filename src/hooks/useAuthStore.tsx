import { create } from "zustand";
import { LoginRes, Auth } from "@/types/AuthAdmin";
import { persist } from "zustand/middleware";

const useAuthStore = create<Auth>()(
  persist(
    (set, get) => ({
      username: "",
      fullname: "",
      email: "",
      user_id: "",
      role_id: "",
      role_name: "",
      bu_id: "",
      permission: [],
      access_token: "",

      setAuth: (loginRes: LoginRes) => {
        set({
          username: loginRes.username,
          fullname: loginRes.fullname,
          email: loginRes.email,
          user_id: loginRes.user_id,
          role_id: loginRes.role_id,
          role_name: loginRes.role_name,
          bu_id: loginRes.bu_id,
          permission: loginRes.permission,
          access_token: loginRes.access_token,
        });
      },

      checkAuth: () => {
        const access_token = get().access_token;
        if (access_token) {
          set({
            access_token: access_token,
          });
        } else {
          window.location.replace("/");
        }
      },

      setAccessToken: newToken => {
        set({ access_token: newToken });
      },

      getPermission: (action: "fcreate" | "fread" | "fupdate" | "fdelete", menuId: number) => {
        const permission = get().permission;
        const menuPermission = permission.find((perm: any) => Number(perm.menu_id) === menuId);

        if (menuPermission && menuPermission[action]) return true;

        return false;
      },

      signOut: () => {
        set({
          username: "",
          fullname: "",
          email: "",
          user_id: "",
          role_id: "",
          role_name: "",
          bu_id: "",
          permission: [],
          access_token: "",
        });
        localStorage.removeItem("auth-storage");
        window.location.replace("/");
      },
    }),
    {
      name: "auth-storage",
      // partialize: (state) => ({
      //   username: state.username,
      //   fullname: state.fullname,
      //   email: state.email,
      //   access_token: state.access_token,
      // }),
    }
  )
);

export default useAuthStore;
