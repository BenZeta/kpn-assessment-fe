import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAPI from "@/hooks/useAPI";
import { AxiosResponse } from "axios";

export type DecodedToken = {
  type: string;
  email: string;
  is_registered: string;
};

export default function RedirectPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const api = useAPI();
  useEffect(() => {
    if (!token) {
      navigate("/login/client");
    }
    (async () => {
      try {
        const { data: decoded_token }: AxiosResponse<DecodedToken> = await api.get(
          `/assessee/${token}`
        );
        if (decoded_token.type == "external") {
          navigate(`/login/client/${token}`);
        } else {
          navigate(`/client/${token}`);
        }
      } catch (error) {
        console.log(error);
        navigate(`/login/client`);
      }
    })();
  }, []);
  return <></>;
}
