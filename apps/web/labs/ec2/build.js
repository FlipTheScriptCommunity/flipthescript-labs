// Bundles the React + Cloudscape lab client into a static bundle, using Bun's
// native bundler (no esbuild/webpack dependency). Output goes straight into
// apps/web/public/labs/ec2 so Next.js serves it as a plain static asset —
// nothing in apps/web itself needs to depend on React/Cloudscape at build time.
//
// Run with: bun run build   (from this directory)

const path = require('path');

const outdir = path.join(__dirname, '../../public/labs/ec2');

async function main() {
  const result = await Bun.build({
    entrypoints: [path.join(__dirname, 'client/index.jsx')],
    outdir,
    naming: 'bundle.[ext]',
    minify: true,
    target: 'browser',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  if (!result.success) {
    for (const message of result.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  for (const output of result.outputs) {
    console.log('Built:', path.relative(process.cwd(), output.path));
  }
}

main();
