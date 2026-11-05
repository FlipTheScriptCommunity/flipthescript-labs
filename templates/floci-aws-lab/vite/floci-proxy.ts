import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';

// The lab console calls the AWS APIs straight from the browser with the real
// AWS SDK, pointed at its own origin (see src/lib/aws.ts). This middleware
// picks those calls out from ordinary page/asset requests and forwards them to
// Floci, so:
//   - there's no CORS to configure — the browser only ever talks to one origin;
//   - it works unchanged inside a Codespace, where the page is served from a
//     forwarded *.app.github.dev URL and Floci's :4566 is not reachable from
//     the student's browser at all;
//   - the browser's Network tab shows the real AWS API calls, which is part of
//     the lesson.
//
// AWS SDK requests are recognised by their SigV4 Authorization header (or the
// x-amz-target header JSON-protocol services send). Floci's own
// /_localstack and /_floci endpoints are forwarded too, for the health check.
//
// Anything under LAMBDA_CODE_PREFIX is forwarded with the prefix stripped:
// Lambda's GetFunction hands back an unsigned download URL for the deployed
// .zip on Floci's own host, which the browser can only reach through here.
export const LAMBDA_CODE_PREFIX = '/_lab/lambda-code';

/** Returns the path to request from Floci, or null if this isn't a Floci request. */
export function flociPath(
  req: Pick<IncomingMessage, 'url' | 'headers'>,
): string | null {
  const url = req.url ?? '/';
  if (url.startsWith(`${LAMBDA_CODE_PREFIX}/`))
    return url.slice(LAMBDA_CODE_PREFIX.length);
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.startsWith('AWS4-HMAC-SHA256'))
    return url;
  if (req.headers['x-amz-target']) return url;
  if (url.startsWith('/_localstack/') || url.startsWith('/_floci/')) return url;
  return null;
}

function forward(
  req: IncomingMessage,
  res: ServerResponse,
  target: URL,
  path: string,
) {
  const proxyReq = http.request(
    {
      hostname: target.hostname,
      port: target.port,
      method: req.method,
      path,
      // Host is rewritten to Floci's own: a forwarded Codespaces hostname
      // (<name>-5173.app.github.dev) must never be mistaken for an S3
      // virtual-hosted bucket name. Floci doesn't enforce SigV4 by default, so
      // the signature the browser computed for the original host still passes.
      headers: { ...req.headers, host: target.host },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', (err) => {
    if (res.headersSent) {
      res.destroy(err);
      return;
    }
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        __type: 'FlociUnreachable',
        message: `Floci is not reachable at ${target.origin} (${err.message}). Start it with: docker compose up -d`,
      }),
    );
  });
  req.pipe(proxyReq);
}

export function flociProxy(options: { target: string }): Plugin {
  const target = new URL(options.target);
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const path = flociPath(req);
    if (path === null) next();
    else forward(req, res, target, path);
  };
  return {
    name: 'floci-proxy',
    // Registered directly (not from a returned post-hook) so it runs before
    // Vite's own middlewares — otherwise Vite would answer GET / (S3
    // ListBuckets) with index.html.
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
