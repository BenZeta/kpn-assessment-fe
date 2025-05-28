import { expose } from "comlink";
import "./workerShim";
let log = console.info;

const renderInWorker = async ({ data, charts }) => {
  try {
    const { RenderPDF } = await import("./RenderPDF");
    return URL.createObjectURL(await RenderPDF({ data, charts }));
  } catch (error) {
    log(error);
    throw error;
  }
};

const onProgress = (cb: typeof console.info) => (log = cb);

expose({ renderInWorker, onProgress });

export type WorkerType = {
  renderInWorker: typeof renderInWorker;
  onProgress: typeof onProgress;
};
