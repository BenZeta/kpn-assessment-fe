export type LoginRes = {
  username: string;
  fullname: string;
  email: string;
  user_id: string;
  role_id: string;
  bu_id: string;
  permission: Array<{
    menu_id: number;
    fcreate: boolean;
    fread: boolean;
    fupdate: boolean;
    fdelete: boolean;
  }>;
  access_token: string;
};

type AuthAction = {
  setAuth: (loginRes: LoginRes) => void;
  checkAuth: () => void;
  setAccessToken: (newToken: string) => void;
  signOut: () => void;
  getPermission: (action: "fcreate" | "fread" | "fupdate" | "fdelete", menuId: number) => boolean;
};

export type Auth = LoginRes & AuthAction;
