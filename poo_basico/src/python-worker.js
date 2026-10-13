let pyodideInstance = null;
const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';

self.onmessage = async event => {
  const { id, code } = event.data || {};
  try {
    if (!pyodideInstance) {
      importScripts(CDN + 'pyodide.js');
      pyodideInstance = await loadPyodide({ indexURL: CDN });
    }
    pyodideInstance.globals.set('__aula_student_code', String(code ?? ''));
    const output = await pyodideInstance.runPythonAsync([
      'import sys, io, traceback',
      '__aula_out = io.StringIO()',
      '__aula_previous_stdout = sys.stdout',
      'sys.stdout = __aula_out',
      'try:',
      '    exec(__aula_student_code, {})',
      'except BaseException:',
      '    traceback.print_exc(file=__aula_out)',
      'finally:',
      '    sys.stdout = __aula_previous_stdout',
      '__aula_out.getvalue()'
    ].join('\n'));
    self.postMessage({ id, output: String(output ?? ''), ready: true });
  } catch (error) {
    self.postMessage({ id, output: String(error?.message || error), failed: true });
  }
};
