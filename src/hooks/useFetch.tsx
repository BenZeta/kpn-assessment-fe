import { useState, useEffect, useCallback } from "react";
import useAPI from "./useAPI";
import { snack } from "@/providers/SnackbarProvider";
import { AxiosError } from "axios";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | Error | null;
  refetch: () => void;
}

const useFetch = <T,>(url?: string | null): FetchState<T> => {
  const API = useAPI();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.get(url || "");
      setData(response.data);
    } catch (error) {
      setError(error);
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
