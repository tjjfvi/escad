
export const attachWorkerFs = (worker: Worker) =>
  // @ts-ignore
  BrowserFS.FileSystem.WorkerFS.attachRemoteListener(worker)
