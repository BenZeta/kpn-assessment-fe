import { API } from "@/utils/api";
import { useEffect } from "react";
import useTokenExternal from "./useTokenExternal";
import { useNavigate } from "react-router-dom";

const useAPI = () => {
  const token_ext = useTokenExternal(state => state.token_ext);
  const setTokenExt = useTokenExternal(state => state.setTokenExt);
  const reset_token = useTokenExternal(state => state.resetTokenExt);
  const navigate = useNavigate();
  useEffect(() => {
    const requestIntercept = API.interceptors.request.use(
      config => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token_ext}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = API.interceptors.response.use(
      response => response,
      async error => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          const resAccessToken = await API.get("/assessee/resettoken");
          const newAccessToken = resAccessToken.data.access_token;

          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          setTokenExt({ token: newAccessToken });
          return API(prevRequest);
        }

        if (error?.response?.status === 403) {
          reset_token();
          navigate("/login/client");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(requestIntercept);
      API.interceptors.response.eject(responseIntercept);
    };
  }, [token_ext]);

  return API;
};

export default useAPI;
