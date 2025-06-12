import useAPI from "./useAPIDarwin";
import useAPIext from "./useAPIExt";
import { useEffect, useState, useCallback } from "react";
import useTokenDarwin from "./useTokenDarwin";
import useTokenExternal from "./useTokenExternal";
import { AxiosError, AxiosResponse } from "axios";
import { BatchMain } from "@/types/AssessmentTypes";

const useGetAssessmentData = () => {
  const nik = useTokenDarwin(state => state.nik);
  const token_darwin = useTokenDarwin(state => state.token_drw);
  const token_ext = useTokenExternal(state => state.token_ext);

  let api = useAPI();
  if (token_ext) {
    api = useAPIext();
  }
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BatchMain[]>([]);

  const reload = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) return;
    if (!token_darwin) return;
    (async () => {
      let nik_data = nik;
      if (nik_data == "") {
        nik_data = token_ext;
      }
      try {
        const { data }: AxiosResponse<{ data: BatchMain[] }> = await api.get(
          `/assessment/darwin/assessee/${nik_data}`
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
  }, [loading, token_darwin]);

  return { data, error, loading, reload };
};

export default useGetAssessmentData;
