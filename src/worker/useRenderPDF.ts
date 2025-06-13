// src/worker/useRenderPDF.tsx
import { useEffect, useState } from "react";
import { proxy, wrap } from "comlink";
// import type { WorkerType } from "./workerPDF";
import type { WorkerType } from "./WorkerPDF";
import Worker from "./workerPDF?worker";
import useAuthStore from "@/hooks/useAuthStore"; // sesuaikan path

export const pdfWorker = wrap<WorkerType>(new Worker());
pdfWorker.onProgress(proxy((info: any) => console.info(info)));

export const useRenderPDF = ({
  data,
  charts,
  ready,
  id_cover,
}: {
  data: any;
  charts: Record<string, string>;
  ready: boolean;
  id_cover: string;
}) => {
  const [url, setUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Ambil accessToken dari store
  const accessToken = useAuthStore(state => state.access_token);

  useEffect(() => {
    if (!ready) return;
    if (!data) return;
    if (!id_cover) return;
    (async () => {
      setLoading(true);
      try {
        // Kirim data, charts, dan accessToken ke worker
        const resultUrl = await pdfWorker.renderInWorker({
          data,
          charts,
          accessToken,
          apiBaseUrl: import.meta.env.VITE_API_URL,
          id_cover,
        });
        setUrl(resultUrl as string);
      } catch (err) {
        console.error("Error in useRenderPDF:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [data, charts, ready, id_cover, accessToken]);

  // Clean up: revoke object URL bila URL berubah atau unmount
  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return { url, loading, error };
};
