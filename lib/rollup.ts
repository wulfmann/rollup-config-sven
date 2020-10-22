import svelte from "rollup-plugin-svelte";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import { terser } from "rollup-plugin-terser";
import virtual from '@rollup/plugin-virtual';
import css from "rollup-plugin-css-only";
import path from 'path'

import { autoGeneratePages } from "./config";

const production =
  process.env.NODE_ENV === "production" || !process.env.ROLLUP_WATCH;

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
  const pages = await autoGeneratePages();

  return pages.map((page: string) => {
    const entry = `import Comp from '${process.cwd()}/${page}';\nexport default new Comp({ target: document.body })`;
    const name = getPathName(page, true);
    const cssFilename = `public/assets/${name}.css`;
    
    const htmlConfig = {
      fileName: name + '.html'
    }

    const sourceMap = false;

    return {
      cache: true,
      treeshake: true,
      input: 'entry',
      output: {
        dir: "public",
        format: "esm",
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
      },
      plugins: [
        virtual({ entry }),
        html(htmlConfig),
        svelte({
          emitCss: true
        }),
        nodeResolve({
          browser: true,
          dedupe: ["svelte"],
          preferBuiltins: true,
        }),
        css({ output: cssFilename }),
        commonjs({ sourceMap }),
        production && terser(),
      ],
    };
  });
};
