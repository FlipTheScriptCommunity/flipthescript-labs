import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config. Defaults are fine while every route is statically
 * rendered from apps/web/src/data/courses.ts.
 *
 * When the site starts reading from the API and uses ISR / `revalidate`, add an
 * incremental cache here, e.g.:
 *
 *   import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
 *   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
 *
 * ...along with an `r2_buckets` binding named NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc.
 */
export default defineCloudflareConfig();
