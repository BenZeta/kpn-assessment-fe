import useAuthDarwinStore from "@/hooks/useAuthDarwinStore";
import useTokenDarwin from "@/hooks/useTokenDarwin";
import useTokenExternal from "@/hooks/useTokenExternal";
import useAuthExternStore from "@/hooks/useAuthExternStore";
import useAPI from "@/hooks/useAPI";
import useAPIEx from "@/hooks/useAPIExt";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { ResponseDataEmpDarwin, ResponseDataEmpExt } from "@/types/AssessmentTypes";
import { AxiosResponse } from "axios";
import { SnackbarProvider } from "@/providers/SnackbarProvider";

export type PayloadDarwin = {
  token_client?: string;
  emp_id?: string;
  encoded_payload?: string;
};

export default function VerifyDarwinToken() {
  const api = useAPI();
  const apiext = useAPIEx();
  const setDarwinStore = useAuthDarwinStore(state => state.setDarwinStore);
  const setAuthExternStore = useAuthExternStore(state => state.setExternStore);
  const token_darwin = useTokenDarwin(state => state.token_drw);
  const token_ext = useTokenExternal(state => state.token_ext);
  const nik = useTokenDarwin(state => state.nik);
  const setTokenDrw = useTokenDarwin(state => state.setTokenDrw);
  const [searchParams] = useSearchParams();
  const resetToken = useTokenDarwin(state => state.resetToken);
  const resetTokenExt = useTokenExternal(state => state.resetTokenExt);
  const enc_token = useMemo(() => searchParams.get("data"), []);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        let payload = {} as PayloadDarwin;
        let is_darwin = false;
        if (token_darwin) {
          payload.token_client = token_darwin;
          payload.emp_id = nik;
          is_darwin = true;
        } else if (enc_token) {
          payload.encoded_payload = enc_token;
          is_darwin = true;
        } else if (token_ext) {
          is_darwin = false;
        } else {
          throw new Error("Unauthorized");
        }
        if (is_darwin) {
          const { data }: AxiosResponse<ResponseDataEmpDarwin> = await api.post(
            "/auth/darwin",
            payload
          );
          setTokenDrw({ token: data.token, nik: data.employee_id });
          setDarwinStore({
            ...data,
            name: data.full_name,
            date_join: data.date_of_joining,
            role_name: data.designation_name,
            comp_payroll: data.contribution_level,
            email: data.company_email_id,
          });
        } else {
          const { data }: AxiosResponse<{ data: ResponseDataEmpExt }> = await apiext.get(
            "/assessee/profile"
          );
          setAuthExternStore(data.data);
        }
      } catch (error) {
        console.error(error);
        resetToken();
        resetTokenExt();
        navigate("/login/client");
      }
    })();
  }, []);
  return <SnackbarProvider>{token_darwin || token_ext ? <Outlet /> : <></>}</SnackbarProvider>;
}
