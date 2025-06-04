// src/worker/workerPDF.ts
import { expose } from "comlink";
import "./workerShim";

let log = console.info;

/**
 * renderInWorker sekarang menerima tiga argumen:
 *  - data, charts, dan aksesToken
 */
const renderInWorker = async ({
  data,
  charts,
  accessToken,
}: {
  data: any;
  charts: Record<string, string>;
  accessToken: string;
}) => {
  const startTime = performance.now();

  try {
    log("Starting PDF render in worker...");

    // Dynamic import RenderPDF
    const { RenderPDF } = await import("./RenderPDF");

    log("Rendering PDF (with proctoring images) ...");

    // Panggil RenderPDF dengan accessToken
    const pdfBlob = await RenderPDF({ data, charts, accessToken });

    // Buat URL Blob agar dapat digunakan di <iframe> / <a href>
    const url = URL.createObjectURL(pdfBlob);

    const endTime = performance.now();
    log(`PDF rendered successfully in ${Math.round(endTime - startTime)}ms`);

    return url;
  } catch (error: any) {
    const endTime = performance.now();
    log(`PDF render failed after ${Math.round(endTime - startTime)}ms:`, error);
    throw new Error(`PDF render failed: ${error.message || "Unknown error"}`);
  }
};

const onProgress = (cb: typeof console.info) => {
  log = cb;
};

expose({ renderInWorker, onProgress });

export type WorkerType = {
  renderInWorker: typeof renderInWorker;
  onProgress: typeof onProgress;
};
