import { useEffect, useState } from "react";

import { proxy, wrap } from "comlink";
import type { WorkerType } from "./WorkerPDF";
import Worker from "./WorkerPDF?worker";

export const pdfWorker = wrap<WorkerType>(new Worker());
pdfWorker.onProgress(proxy((info: any) => console.log(info)));

export const useRenderPDF = ({ data, charts, ready }) => {
  const [url, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      setLoading(true);
      try {
        const result = await pdfWorker.renderInWorker({ data, charts });
        setData(result);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [charts, ready]);

  useEffect(() => (url ? () => URL.revokeObjectURL(url) : undefined), [url]);
  return { url, loading, error };
};
