import svelte from 'rollup-plugin-svelte';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import { terser } from 'rollup-plugin-terser';
import virtual from '@rollup/plugin-virtual';
import copy from 'rollup-plugin-copy';
import cssChunks from 'rollup-plugin-css-chunks';
import path from 'path';

import { loadConfig, autoGeneratePages, Config } from './config';

const cleanRoute = (route: string, config: Config) => {
  let result = route;
  if (route.startsWith(config.pagesDir)) {
    result = route.slice(config.pagesDir.length);
  }

  if (result.startsWith('/')) {
    result = result.slice(1);
  }

  return result;
};

const getPathName = (page: string, config: Config): string => {
  const name = path.parse(page);
  const parent = cleanRoute(name.dir, config);

  let routeName = name.name;

  if (name.name !== 'index' && config.cleanUrls) {
    routeName = `${name.name}/index`;
  }

  return parent ? `${parent}/${routeName}` : routeName
};

export const createConfig = async () => {
  const config: Config = loadConfig();
  const pages = await autoGeneratePages(config);

  return pages.map((page: string) => {
    const entry = `import Comp from '${process.cwd()}/${page}';\nexport default new Comp({ target: document.body })`;
    const name = getPathName(page, config);

    const htmlConfig = {
      fileName: name + '.html',
      title: name,
    };

    return {
      cache: true,
      treeshake: true,
      input: 'entry',

      output: {
        dir: config.outDir,
        format: 'esm',
        entryFileNames: `${config.assetDir}/${name}/[hash].js`,
        chunkFileNames: `${config.assetDir}/[name].[hash].js`,
        sourcemap: config.sourceMaps,

        manualChunks: {
          'svelte': ['node_modules/svelte'],
          'common.styles': config.commonStyles
        }
      },

      plugins: [
        copy({
          targets: [
            {
              src: `${config.staticDir}/*`,
              dest: config.outDir,
            },
          ],
        }),

        cssChunks({
          chunkFileNames: `${config.assetDir}/[name].[hash].css`,
          entryFileNames: `${config.assetDir}/${name}/[hash].css`,
        }),

        /**
         * We create a virtual module to use as the entry point.
         * Functionally this treats each page as it's own app
         */
        virtual({ entry }),

        html(htmlConfig),

        svelte(config.svelteConfig),

        nodeResolve({
          browser: true,
          dedupe: ['svelte'],
          preferBuiltins: true,
        }),

        // css({ output: cssFilename }),

        commonjs({ sourceMap: config.sourceMaps }),

        config.production && terser(),
      ],
    };
  });
};
