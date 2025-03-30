import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

const src = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

const contentEntry = resolve(src, 'content.jsx');
const otherEntries = {
  popup: resolve(src, 'popup.jsx'),
  background: resolve(src, 'background.js'),
};

export default defineConfig(() => {
  const isContentBuild = process.env.BUILD_TARGET === 'content';

  return {
    resolve: {
      alias: {
        '@src': src,
      },
    },
    plugins: [
      preact({ useRecommendedBuildConfig: false }),
    ],
    publicDir,
    build: {
      outDir,
      emptyOutDir: false,
      rollupOptions: {
        input: isContentBuild ? contentEntry : otherEntries,
        output: {
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name].[ext]',
          ...(isContentBuild && { inlineDynamicImports: true }),
        },
        ...(isContentBuild && { external: [] }),
      },
    },
  };
});
