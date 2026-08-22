import nx from '@nx/eslint-plugin';
import baseConfig from '../../../../eslint.config.mjs';

/**
 * The EC2 lab is a standalone React/Cloudscape package built to a static bundle
 * (see build.js) rather than part of the Next.js app, so it lints on its own:
 * plain JSX, no TypeScript, and the React Hooks rules the source refers to.
 */
export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['client/**/*.jsx', 'client/**/*.js', 'build.js'],
    rules: {
      // The tutorial copy uses U+0001/U+0002 as invisible bidi markers around
      // LTR segments; the regex that splits on them is intentional.
      'no-control-regex': 'off',
    },
  },
];
