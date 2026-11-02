// Runs the student's Lambda handler for real — in a Web Worker, in their own
// browser — and reports the result in the same shape as the real Lambda
// console's "Execution results": response, function logs (START / END /
// REPORT lines), duration, billed duration, memory, and init duration on a
// cold start.
//
// The worker isolates the student's code from the lab page: an infinite
// loop or a crash can't freeze the console, and a timeout simply terminates
// the worker — just like Lambda stops a function at its configured timeout.

// Runs inside the worker. It's turned into source code with toString(), so
// it must not reference anything from this module's scope.
function workerMain() {
  const send = (message) => globalThis.postMessage(message);
  let requestId = '';

  const format = (args) =>
    args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.stack || String(arg);
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

  [
    ['log', 'INFO'],
    ['info', 'INFO'],
    ['warn', 'WARN'],
    ['error', 'ERROR'],
    ['debug', 'DEBUG'],
  ].forEach(([method, level]) => {
    console[method] = (...args) =>
      send({
        type: 'log',
        line: `${new Date().toISOString()}\t${requestId}\t${level}\t${format(args)}`,
      });
  });

  const errorPayload = (error, fallbackType, codeUrl) => ({
    errorType: (error && error.name) || fallbackType,
    errorMessage: (error && error.message) || String(error),
    trace: String((error && error.stack) || '')
      .split(codeUrl)
      .join('file:///var/task/index.mjs')
      .split('\n')
      .filter(Boolean),
  });

  globalThis.onmessage = async ({ data }) => {
    const { code, event, env, context } = data;
    requestId = context.awsRequestId;
    globalThis.process = { env };

    const codeUrl = URL.createObjectURL(
      new Blob([code], { type: 'text/javascript' }),
    );

    const initStart = performance.now();
    let mod;
    try {
      mod = await import(codeUrl);
    } catch (error) {
      const isSyntax = error instanceof SyntaxError;
      const missing = /Failed to resolve module specifier "?([^"\s]+)/.exec(
        String(error && error.message),
      );
      send({
        type: 'done',
        ok: false,
        initMs: performance.now() - initStart,
        durationMs: 0,
        error: missing
          ? {
              errorType: 'Runtime.ImportModuleError',
              errorMessage: `Error: Cannot find package '${missing[1]}'. This lab runs your code in the browser, so only code without imports can run here.`,
              trace: [],
            }
          : {
              ...errorPayload(error, 'Error', codeUrl),
              errorType: isSyntax
                ? 'Runtime.UserCodeSyntaxError'
                : 'Runtime.ImportModuleError',
              errorMessage: `${(error && error.name) || 'Error'}: ${(error && error.message) || error}`,
            },
      });
      return;
    }
    const initMs = performance.now() - initStart;

    if (typeof mod.handler !== 'function') {
      send({
        type: 'done',
        ok: false,
        initMs,
        durationMs: 0,
        error: {
          errorType: 'Runtime.HandlerNotFound',
          errorMessage: 'index.handler is undefined or not exported',
          trace: [],
        },
      });
      return;
    }

    const deadline = Date.now() + context.timeoutMs;
    const lambdaContext = {
      ...context,
      getRemainingTimeInMillis: () => Math.max(deadline - Date.now(), 0),
    };

    const start = performance.now();
    try {
      const result = await mod.handler(event, lambdaContext);
      const durationMs = performance.now() - start;
      let response;
      try {
        response =
          result === undefined ? null : JSON.parse(JSON.stringify(result));
      } catch (error) {
        send({
          type: 'done',
          ok: false,
          initMs,
          durationMs,
          error: {
            errorType: 'Runtime.MarshalError',
            errorMessage: `Unable to marshal response: ${error.message}`,
            trace: [],
          },
        });
        return;
      }
      send({ type: 'done', ok: true, initMs, durationMs, response });
    } catch (error) {
      send({
        type: 'done',
        ok: false,
        initMs,
        durationMs: performance.now() - start,
        error: errorPayload(error, 'Error', codeUrl),
      });
    }
  };
}

const WORKER_SOURCE = `(${workerMain.toString()})();`;

const randomHex = (length) =>
  Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');

const newRequestId = () =>
  `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${'89ab'[Math.floor(Math.random() * 4)]}${randomHex(3)}-${randomHex(12)}`;

/**
 * Invoke `code`'s exported handler with `event`.
 * Resolves with { status, response, logs, requestId, durationMs,
 * billedMs, initMs, memoryMb, maxMemoryUsedMb }.
 */
export function invoke({ code, event, fn, coldStart }) {
  const requestId = newRequestId();
  const timeoutMs = fn.timeout * 1000;
  const logs = [`START RequestId: ${requestId} Version: $LATEST`];

  const workerUrl = URL.createObjectURL(
    new Blob([WORKER_SOURCE], { type: 'text/javascript' }),
  );
  const worker = new Worker(workerUrl, { type: 'module' });

  const finish = (resolve, outcome) => {
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
    const durationMs = outcome.durationMs;
    const billedMs = Math.max(1, Math.ceil(durationMs));
    const maxMemoryUsedMb = Math.min(
      fn.memory,
      62 + Math.floor(Math.random() * 12),
    );
    logs.push(`END RequestId: ${requestId}`);
    logs.push(
      [
        `REPORT RequestId: ${requestId}`,
        `Duration: ${durationMs.toFixed(2)} ms`,
        `Billed Duration: ${billedMs} ms`,
        `Memory Size: ${fn.memory} MB`,
        `Max Memory Used: ${maxMemoryUsedMb} MB`,
        ...(coldStart
          ? [`Init Duration: ${outcome.initMs.toFixed(2)} ms`]
          : []),
      ].join('\t'),
    );
    resolve({
      status: outcome.ok ? 'Succeeded' : 'Failed',
      response: outcome.ok ? outcome.response : outcome.error,
      logs: logs.join('\n'),
      requestId,
      durationMs,
      billedMs,
      initMs: coldStart ? outcome.initMs : null,
      memoryMb: fn.memory,
      maxMemoryUsedMb,
    });
  };

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      logs.push(
        `${new Date().toISOString()} ${requestId} Task timed out after ${fn.timeout.toFixed(2)} seconds`,
      );
      finish(resolve, {
        ok: false,
        durationMs: timeoutMs,
        initMs: 0,
        error: {
          errorType: 'Sandbox.Timedout',
          errorMessage: `RequestId: ${requestId} Error: Task timed out after ${fn.timeout.toFixed(2)} seconds`,
        },
      });
    }, timeoutMs);

    worker.onmessage = ({ data }) => {
      if (data.type === 'log') {
        logs.push(data.line);
        return;
      }
      clearTimeout(timer);
      if (!data.ok) {
        logs.push(
          `${new Date().toISOString()}\t${requestId}\tERROR\tInvoke Error \t${JSON.stringify(data.error)}`,
        );
      }
      finish(resolve, data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      e.preventDefault();
      finish(resolve, {
        ok: false,
        durationMs: 0,
        initMs: 0,
        error: {
          errorType: 'Runtime.Unknown',
          errorMessage: e.message || 'The function crashed.',
        },
      });
    };

    worker.postMessage({
      code,
      event,
      env: {
        AWS_REGION: fn.region,
        AWS_LAMBDA_FUNCTION_NAME: fn.name,
        AWS_LAMBDA_FUNCTION_MEMORY_SIZE: String(fn.memory),
        AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
        AWS_LAMBDA_LOG_GROUP_NAME: fn.logGroup,
      },
      context: {
        functionName: fn.name,
        functionVersion: '$LATEST',
        invokedFunctionArn: fn.arn,
        memoryLimitInMB: String(fn.memory),
        awsRequestId: requestId,
        logGroupName: fn.logGroup,
        logStreamName: `${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/[$LATEST]${randomHex(32)}`,
        timeoutMs,
      },
    });
  });
}
