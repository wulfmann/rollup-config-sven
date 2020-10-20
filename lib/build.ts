import path from "path";
import glob from "glob";

import { Config, Route, Routes } from "./config";
import { trimPrefix } from "./utils";
import { Page, Entrypoint } from "./template";

const autoGenerateRoutes = (config: Config): Promise<Routes> => {
  return new Promise((resolve, reject) => {
    const {
      config: { src, pages },
      entrypointsDir,
    } = config;

    const pageDir = `${src}/${pages}`;
    const pageGlob = `${pageDir}/**/*.svelte`;

    glob(pageGlob, {}, function (err: any, files: string[]) {
      if (err) {
        reject(err);
      }

      resolve(
        files.map((file) => {
          const baseDir = trimPrefix(path.dirname(file), pageDir);
          const filename = path.basename(file, path.extname(file));
          const resource =
            filename === "index" ? baseDir : `${baseDir}/${filename}`;

          return {
            src: path.join(__dirname, "../", file),
            path: resource ? resource : "/",
            entrypoint: `${entrypointsDir}${resource ? resource : "/index"}.js`,
          };
        })
      );
    });
  });
};

export class Build {
  constructor(public config: Config) {}

  async generateRoutes(): Promise<Routes> {
    if (this.config.config.routes) {
      return this.config.config.routes(this.config);
    }

    return await autoGenerateRoutes(this.config);
  }

  createRoute(route: Route) {
      this.createEntrypoint(route)
      this.createPage(route)
  }

  createEntrypoint(route: Route) {
    const template = new Entrypoint();
    template
      .render({
        path: route.src,
        target: "document.body",
      })
      .save(route.entrypoint);
  }

  createPage(route: Route) {
    const template = new Page();
    template
      .render({
        title: route.path.replace("/", " ").trim(),
        scripts: {
          css: `/assets${route.path}/main.css`,
          js: `/assets${route.path}/main.js`,
        },
      })
      .save(`${this.config.config.out}${route.path}/index.html`);
  }
}
