import { useState, useEffect, useCallback } from "react";
import useAPI from "./useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosError } from "axios";
import useAuthStore from "./useAuthStore";
import useAPIAssessee from "./useAPIAssesse";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | Error | null;
  refetch: () => void;
}

const useFetch = <T,>(url?: string | null): FetchState<T> => {
  const access_token_admin = useAuthStore(state => state.access_token);

  let API = useAPI();
  if (!access_token_admin) {
    API = useAPIAssessee();
  }
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError<{ message: string }> | Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.get(url || "");
      setData(response.data);
    } catch (error) {
      setError(error as AxiosError<{ message: string }>);
      console.error(error);
      snack.error("Fetch Error", true);
    } finally {
      setLoading(false);
    }
  }, [url, API]);

  useEffect(() => {
    if (url) fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
