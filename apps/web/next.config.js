//@ts-check

const path = require('node:path');

// Inlines `.yaml` files as string modules at compile time (see the loader file).
const rawTextLoader = path.join(__dirname, 'loaders/raw-text-loader.cjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required by the OpenNext Cloudflare adapter (`nx cf:build|preview|deploy web`),
  // which packages `.next/standalone` into a Worker. Harmless for `next dev`/`next start`.
  output: 'standalone',
  // In a monorepo Next.js has to be told where to stop tracing server deps,
  // otherwise it guesses apps/web and misses hoisted node_modules at the root.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // `next build` uses Turbopack (Next 16 default).
  turbopack: {
    rules: {
      '*.yaml': { loaders: [rawTextLoader], as: '*.js' },
    },
  },
  // `next dev --webpack` (see package.json "dev").
  webpack: (config) => {
    config.module.rules.push({ test: /\.yaml$/, use: [rawTextLoader] });
    return config;
  },
  // "Courses" became "tracks" and the step-by-step "labs" became "guides" —
  // the `labs` name is reserved for the upcoming Floci challenges. Keep old
  // links working. The local-development course was folded into
  // aws-foundations (its Floci guide is now that track's setup step).
  async redirects() {
    return [
      {
        source: '/courses/local-development/labs/:guideId',
        destination: '/tracks/aws-foundations/guides/:guideId',
        permanent: true,
      },
      {
        source: '/courses/local-development',
        destination: '/tracks/aws-foundations',
        permanent: true,
      },
      {
        source: '/courses/:trackId/labs/:guideId',
        destination: '/tracks/:trackId/guides/:guideId',
        permanent: true,
      },
      {
        source: '/courses/:trackId',
        destination: '/tracks/:trackId',
        permanent: true,
      },
      { source: '/courses', destination: '/tracks', permanent: true },
      {
        source: '/labs/:path*',
        destination: '/guides/:path*',
        permanent: true,
      },
    ];
  },
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
};

module.exports = nextConfig;
