let worker = null;
let nextId = 1;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./python-worker.js', import.meta.url));
  worker.onmessage = event => {
    const item = pending.get(event.data?.id);
    if (!item) return;
    pending.delete(event.data.id);
    clearTimeout(item.timer);
    item.resolve({ output: event.data.output || '', failed: Boolean(event.data.failed) });
  };
  worker.onerror = event => {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error(event.message || 'Falló el entorno Python.'));
    }
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

export function runPython(code, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    const w = getWorker();
    const timer = setTimeout(() => {
      pending.delete(id);
      w.terminate();
      worker = null;
      reject(new Error('La ejecución tardó demasiado y se detuvo. Revisa si hay un ciclo infinito.'));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    w.postMessage({ id, code: String(code ?? '') });
  });
}
