import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import autoprefixer from 'autoprefixer';
import { fontConversionPlugin } from './scripts/vite-font-plugin.js';

export default defineConfig({
    plugins: [
        fontConversionPlugin(),
        laravel({
            input: ['resources/css/app.css', 'resources/css/test.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
    css: {
        postcss: {
            plugins: [
                autoprefixer()
            ]
        }
    },
    build: {
        target: 'es2015',
        cssTarget: 'chrome80',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: undefined,
            }
        }
    }
});
