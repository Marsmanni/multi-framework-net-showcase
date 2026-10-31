import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const appInfo = () => ({
    name: 'app-info-meta',
    transformIndexHtml: (html: string) => html
        .replace('__APP_VERSION__', process.env.APP_VERSION || pkg.version)
        .replace('__APP_BUILD__', new Date().toISOString())
        .replace('__APP_COMMIT__', process.env.GITHUB_SHA || 'unknown'),
});

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/apps/sample-vue/' : '/',
    plugins: [plugin(), appInfo()],
    server: {
        port: 5174,
        strictPort: true,
        open: true,
    },
    preview: {
        port: 4174,
        strictPort: true,
    }
}))
