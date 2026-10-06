import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kakadu525.github.io',
  // Стили сайта занимают несколько килобайт: встроенные в HTML, они не задерживают первую отрисовку
  // отдельным запросом.
  build: { format: 'directory', inlineStylesheets: 'always' },
});
