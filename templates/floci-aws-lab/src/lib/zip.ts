import { strToU8, zipSync } from 'fflate';

// Lambda's API takes function code as a .zip — this builds one in the browser
// from the single source file the console's code editor holds.
export function buildLambdaZip(fileName: string, source: string): Uint8Array {
  return zipSync({ [fileName]: strToU8(source) });
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
