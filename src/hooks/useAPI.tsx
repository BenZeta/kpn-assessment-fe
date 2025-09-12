import { API } from "@/utils/api";
import { useEffect } from "react";
import useAuthStore from "./useAuthStore";

const useAPI = () => {
  const user_id = useAuthStore(state => state.user_id);
  const username = useAuthStore(state => state.username);
  const fullname = useAuthStore(state => state.fullname);
  const email = useAuthStore(state => state.email);
  const role_id = useAuthStore(state => state.role_id);
  const bu_id = useAuthStore(state => state.bu_id);

  const accessToken = useAuthStore(state => state.access_token);
  const setAccessToken = useAuthStore(state => state.setAccessToken);

  const signOut = useAuthStore(state => state.signOut);

  useEffect(() => {
    const requestIntercept = API.interceptors.request.use(
      config => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
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

          const resAccessToken = await API.post("/admin/get-token", {
            user_id,
            username,
            fullname,
            email,
            role_id,
            bu_id,
          });
          const newAccessToken = resAccessToken.data.access_token;

          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          setAccessToken(newAccessToken);

          return API(prevRequest);
        }

        if (error?.response?.status === 403) {
          console.log(error);
          signOut();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(requestIntercept);
      API.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken]);

  return API;
};

export default useAPI;
