import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  {
    ignores: [
      '.next/**/*',
      // OpenNext Cloudflare adapter output (generated bundles).
      '.open-next/**/*',
      '.wrangler/**/*',
      '**/out-tsc',
      // Static assets, including the pre-built guide bundles produced by
      // `guides/<guideId>/build.js` — generated code, not ours to lint.
      'public/**/*',
      // Standalone guide sources are their own Nx projects with their own deps
      // and eslint config (guides/<guideId>/eslint.config.mjs).
      'guides/**/*',
    ],
  },
];
