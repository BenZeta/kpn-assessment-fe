import useAPI from "./useAPIDarwin";
import { useEffect, useState, useCallback } from "react";
import useTokenDarwin from "./useTokenDarwin";
import { AxiosError, AxiosResponse } from "axios";
import { BatchMain } from "@/types/AssessmentTypes";

const useGetAssessmentData = () => {
  const api = useAPI();
  const nik = useTokenDarwin(state => state.nik);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BatchMain[]>([]);

  const reload = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) return;
    (async () => {
      try {
        const { data }: AxiosResponse<{ data: BatchMain[] }> = await api.get(
          `/assessment/darwin/assessee/${nik}`
        );
        setData(data.data);
        setError(null);
      } catch (error) {
        console.error(error);
        setData([]);
        setError(error as unknown as AxiosError);
      } finally {
        setLoading(false);
      }
    })();
  }, [loading]);

  return { data, error, loading, reload };
};

export default useGetAssessmentData;
