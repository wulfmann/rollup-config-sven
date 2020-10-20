import path from 'path';
import { nanoid } from "nanoid";

export interface Route {
  src: string;
  entrypoint: string;
  path: string;
}

export type Routes = Route[];

export interface ConfigOptions {
    src: string;
    out: string;
    pages: string;
    sourcemap: boolean;
    assets: string;
    public: string;
    cwd?: string;
    buildId?: string;
    production: boolean;

    routes?: (config: Config) => Routes;
    rollup?: (rollupConfig: any) => any;
}

export const defaultConfig: ConfigOptions = {
  src: "src",
  out: "public",
  pages: "pages",
  sourcemap: false,
  assets: "assets",
  public: "public",
  production: false
};

export interface ConfigOptions {}

export class Config {
  public config: ConfigOptions
  public id: string;
  public cwd: string;
  public entrypointsDir: string;

  constructor(configPath = 'sven.config.js') {
    this.config = this.loadConfig(configPath);
    this.cwd = this.config.cwd || process.cwd();
    this.id = this.config.buildId || nanoid();
    this.entrypointsDir = `${this.config.cwd}/.sven/${this.id}/entrypoints`;
  }

  private loadConfig(configPath: string): ConfigOptions {
    try {
      return require(path.join(this.cwd, configPath))
    } catch {
      return defaultConfig
    }
  }
}
