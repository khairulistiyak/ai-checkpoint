import { Worker } from 'worker_threads';

export function runWorkerScan(projectPath, scanType, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const workerPath = new URL('./scanner-worker.js', import.meta.url);
    const worker = new Worker(workerPath, {
      workerData: { projectPath, scanType }
    });
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error(`Scanner timeout (${Math.round(timeoutMs / 1000)}s)`));
    }, timeoutMs);

    worker.on('message', (msg) => {
      clearTimeout(timeout);
      if (msg.success) resolve(msg.result);
      else reject(new Error(msg.error));
    });
    worker.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
