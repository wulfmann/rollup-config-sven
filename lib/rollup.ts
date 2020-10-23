import svelte from "rollup-plugin-svelte";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import { terser } from "rollup-plugin-terser";
import virtual from '@rollup/plugin-virtual';
import css from "rollup-plugin-css-only";
import path from 'path'

import { loadConfig, autoGeneratePages, Config } from "./config";

const getPathName = (page: string, clean: boolean): string => {
  const pages = 'pages'
  const name = path.parse(page);

  if (name.name === 'index') {
    if (name.dir === pages) {
      return 'index'
    } else {
      return `${name.dir}/index`
    }
  }

  if (clean) {
    return `${name.name}/index`
  } else {
    return name.name
  }
}

export const createConfig = async () => {
  const config: Config = loadConfig()
  const pages = await autoGeneratePages(config);

  return pages.map((page: string) => {
    const entry = `import Comp from '${process.cwd()}/${page}';\nexport default new Comp({ target: document.body })`;
    const name = getPathName(page, config.cleanUrls);
    const cssFilename = `${config.outDir}/${config.assetDir}/${name}.css`;
  
    const htmlConfig = {
      fileName: name + '.html'
    }

    return {
      cache: true,
      treeshake: true,
      input: 'entry',

      output: {
        dir: config.outDir,
        format: "esm",
        entryFileNames: `${config.assetDir}/[hash].js`,
        chunkFileNames: `${config.assetDir}/[hash].js`,
      },

      plugins: [
        /**
         * We create a virtual module to use as the entry point.
         * Functionally this treats each page as it's own app
         */
        virtual({ entry }),

        html(htmlConfig),

        svelte(config.svelteConfig),

        nodeResolve({
          browser: true,
          dedupe: ["svelte"],
          preferBuiltins: true,
        }),

        css({ output: cssFilename }),
        commonjs({ sourceMap: config.sourceMaps }),
        config.production && terser(),
      ],
    };
  });
};
