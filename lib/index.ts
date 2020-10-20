// Rollup
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

// Dependencies
import { trimPrefix } from './utils';
import { Config, Route } from './config';
import { Build } from './build';
import { RollupOptions } from 'rollup';

export class Sven {
  public config: Config;
  public build: Build;

  constructor() {
    this.config = new Config();
    this.build = new Build(this.config);
  }

  public createRollupConfig(route: Route) {
    const { config } = this.config;

    const entryName = trimPrefix(`${trimPrefix(route.path, '/')}/main.js`, '/');

    this.build.createRoute(route);

    const plugins = [
      svelte({
        // dev: !config.production,
        css: (css) => {
          css.write(
            trimPrefix(`${trimPrefix(route.path, '/')}/main.css`, '/'),
            config.sourcemap
          );
        },
      }),

      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          config.production ? 'production' : 'development'
        ),
      }),
    ];

    if (config.production) {
      plugins.push(terser());
    }

    const rollupConfig: RollupOptions = {
      input: route.entrypoint,

      output: {
        sourcemap: config.sourcemap,
        format: 'esm',
        entryFileNames: entryName,
        chunkFileNames: entryName,
        dir: `${config.out}/assets`,
      },

      context: 'null',

      plugins,

      watch: {
        clearScreen: false,
      },
    };

    if (config.rollup) {
      return config.rollup(rollupConfig);
    } else {
      return rollupConfig;
    }
  }

  public async generateConfig(): Promise<RollupOptions[]> {
    const routes = await this.build.generateRoutes()
    return routes.map(this.createRollupConfig)
  }
}

export default new Sven().generateConfig();
