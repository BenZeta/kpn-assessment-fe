import useAuthDarwinStore from "@/hooks/useAuthDarwinStore";
import useTokenDarwin from "@/hooks/useTokenDarwin";
import useAPI from "@/hooks/useAPI";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { ResponseDataEmpDarwin } from "@/types/AssessmentTypes";
import { AxiosResponse } from "axios";
import { SnackbarProvider } from "@/providers/SnackbarProvider";

export type PayloadDarwin = {
  token_client?: string;
  emp_id?: string;
  encoded_payload?: string;
};

export default function VerifyDarwinToken() {
  const api = useAPI();
  const darwin_sess = useAuthDarwinStore(state => state.darwin_sess);
  const setDarwinStore = useAuthDarwinStore(state => state.setDarwinStore);
  const token_darwin = useTokenDarwin(state => state.token_drw);
  console.log("token_darwin", token_darwin);
  const nik = useTokenDarwin(state => state.nik);
  const setTokenDrw = useTokenDarwin(state => state.setTokenDrw);
  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = useTokenDarwin(state => state.resetToken);
  const enc_token = useMemo(() => searchParams.get("data"), []);

  useEffect(() => {
    (async () => {
      try {
        let payload = {} as PayloadDarwin;
        if (token_darwin) {
          payload.token_client = token_darwin;
          payload.emp_id = nik;
        } else if (enc_token) {
          payload.encoded_payload = enc_token;
        } else {
          throw new Error("Token not provided");
        }
        const { data }: AxiosResponse<ResponseDataEmpDarwin> = await api.post(
          "/auth/darwin",
          payload
        );
        setTokenDrw({ token: data.token, nik: data.employee_id });
        setDarwinStore({
          name: data.full_name,
          date_join: data.date_of_joining,
          role_name: data.designation_name,
          comp_payroll: data.contribution_level,
          email: data.company_email_id,
        });
      } catch (error) {
        console.error(error);
        resetToken();
        // location.replace(`https://kpncorporation.darwinbox.com/user/login`);
      }
    })();
  }, []);
  return (
    <SnackbarProvider>
      <Outlet />
    </SnackbarProvider>
  );
}
