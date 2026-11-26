// @ts-check
/**
 * Minimal webpack/Turbopack loader: exposes a text file as an ES module whose
 * default export is the file contents. Used for src/data/contributors.yaml so
 * the YAML is inlined into the server bundle at compile time (no fs at runtime
 * on Cloudflare Workers).
 * @param {string} source
 */
module.exports = function rawTextLoader(source) {
  return `export default ${JSON.stringify(source)};`;
};
