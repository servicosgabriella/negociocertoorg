// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://negociocerto.org',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  server: {
    host: true,
 allowedHosts: ['dedicator-primarily-compel.ngrok-free.dev'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
