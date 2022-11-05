import express from 'express';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { CounterWorkerData } from './counter-worker';

const app = express();

app.get('/non-blocking', (_request, response) => {
  response.status(200).json({ message: '[non-blocking response] ...' });
});

const COUNTER_WORKER_PATH = path.resolve(__dirname, 'counter-worker.ts');

function runCounterWorker(workerId: number, counterIterations: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const workerData: CounterWorkerData = { workerId, counterIterations };
    const counterWorker = new Worker(COUNTER_WORKER_PATH, { workerData });

    counterWorker.on('message', (counter: number) => {
      return resolve(counter);
    });
    counterWorker.on('error', (error) => {
      return reject(error);
    });
  });
}

const NUMBER_OF_COUNTER_WORKERS = 5;
const COUNTER_ITERATIONS = 5 * 10e8;

async function calculateCounter(numberOfWorkers: number): Promise<number> {
  const workerPromises = Array.from({ length: numberOfWorkers }, (_, index) => {
    return runCounterWorker(index, COUNTER_ITERATIONS / numberOfWorkers);
  });
  const workerCounters = await Promise.all(workerPromises);
  return workerCounters.reduce((total, counter) => total + counter, 0);
}

app.get('/blocking', async (_request, response) => {
  const counter = await calculateCounter(NUMBER_OF_COUNTER_WORKERS);
  response.status(200).json({ message: `[blocking response] Result: ${counter}` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}...`);
});
