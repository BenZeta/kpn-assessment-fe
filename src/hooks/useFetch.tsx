import { useState, useEffect, useCallback, useMemo } from "react";
import useAPI from "./useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosError } from "axios";
import useAuthStore from "./useAuthStore";
import useAPIAssessee from "./useAPIAssesse";
import useTokenAssessee from "./useTokenAssessee";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | Error | null;
  refetch: () => void;
}

const useFetch = <T,>(url?: string | null): FetchState<T> => {
  const access_token_admin = useAuthStore(state => state.access_token);
  const access_token_asse = useTokenAssessee(state => state.token_as);

  let APIAdmin = useAPI();
  let APIAssessee = useAPIAssessee();

  let API = useMemo(() => {
    if (access_token_admin != "") {
      return APIAdmin;
    } else if (access_token_asse && access_token_asse !== "") {
      return APIAssessee;
    } else {
      return null;
    }
  }, [APIAdmin, APIAssessee, access_token_admin, access_token_asse]);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError<{ message: string }> | Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (API) {
        const response = await API.get(url || "");
        setData(response.data);
      }
    } catch (error) {
      setError(error as AxiosError<{ message: string }>);
      console.error(error);
      snack.error("Fetch Error", true);
    } finally {
      setLoading(false);
    }
  }, [url, API]);

  useEffect(() => {
    if (url && API) fetchData();
  }, [url, fetchData, API]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
