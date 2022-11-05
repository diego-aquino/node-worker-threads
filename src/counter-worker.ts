import { parentPort, workerData } from 'node:worker_threads';

export interface CounterWorkerData {
  workerId: number;
  counterIterations: number;
}

function main() {
  const { workerId, counterIterations } = workerData as CounterWorkerData;

  console.log(`[worker ${workerId}] Starting counter...`);

  let counter = 0;
  for (let iteration = 1; iteration <= counterIterations; iteration++) {
    counter++;
  }

  console.log(`[worker ${workerId}] Finished counter at ${counter}...`);

  parentPort?.postMessage(counter);
}

main();
