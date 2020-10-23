import path from 'path';
import glob from 'glob';

export interface Config {
    assetDir: string;
    pagesDir: string;
    outDir: string;
    staticDir: string
    cleanUrls: boolean;
    production: boolean;
    sourceMaps: boolean;
    svelteConfig: {
        [key: string]: any
    }
}

export const loadConfig = () => {
    const production = process.env.NODE_ENV === "production" || !process.env.ROLLUP_WATCH;

    const defaultConfig: Config = {
        assetDir: 'assets',
        pagesDir: `pages`,
        outDir: 'public',
        staticDir: 'static',
        cleanUrls: true,
        production,
        sourceMaps: !production,
        svelteConfig: {
            emitCss: true
        }
    }

    const config = require(path.join(process.cwd(), 'sven.config.js'));

    return Object.assign({}, defaultConfig, config)
}

export const autoGeneratePages = (config: Config): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(`${config.pagesDir}/**/*.svelte`, {}, function (err: any, files: string[]) {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
};
