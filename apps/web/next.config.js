//@ts-check

const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required by the OpenNext Cloudflare adapter (`nx cf:build|preview|deploy web`),
  // which packages `.next/standalone` into a Worker. Harmless for `next dev`/`next start`.
  output: 'standalone',
  // In a monorepo Next.js has to be told where to stop tracing server deps,
  // otherwise it guesses apps/web and misses hoisted node_modules at the root.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
};

module.exports = nextConfig;
