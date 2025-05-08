import { API } from "@/utils/api";
import { useEffect } from "react";
import useTokenDarwin from "./useTokenDarwin";

const useAPI = () => {
  const token = useTokenDarwin(state => state.token_drw);
  const reset_token = useTokenDarwin(state => state.resetToken);
  useEffect(() => {
    const requestIntercept = API.interceptors.request.use(
      config => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = API.interceptors.response.use(
      response => response,
      async error => {
        if (error?.response?.status === 403) {
          reset_token();
          // location.replace("https://kpncorporation.darwinbox.com/user/login");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(requestIntercept);
      API.interceptors.response.eject(responseIntercept);
    };
  }, [token]);

  return API;
};

export default useAPI;
