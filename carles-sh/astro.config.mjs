// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Cloudflare-local secrets come only from .dev.vars, never the legacy .env.
process.env.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false';

// https://astro.build/config
export default defineConfig({
  site: 'https://carles.sh',
  adapter: cloudflare({ imageService: 'compile' }),
  // The app does not use sessions; avoid the adapter's default KV binding.
  session: { driver: { entrypoint: 'unstorage/drivers/null' } },
});
