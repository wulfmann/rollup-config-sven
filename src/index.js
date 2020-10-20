import path from "path";
import fs from "fs";

// Rollup
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";

// Dependencies
import glob from "glob";
import ejs from "ejs";
import { nanoid } from "nanoid";

import { trimPrefix } from "./utils";

const gatherPages = ({ build }) => {
  return new Promise((resolve, reject) => {
    const {
      config: { src, pages },
      entrypointsDir,
    } = build;
    const pageDir = `${src}/${pages}`;
    const pageGlob = `${src}/${pages}/**/*.svelte`;

    glob(pageGlob, {}, function (err, files) {
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
            resource: resource ? resource : "/",
            entrypoint: `${entrypointsDir}${resource ? resource : "/index"}.js`,
          };
        })
      );
    });
  });
};

const defaultConfig = {
  src: "src",
  out: "public",
  pages: "pages",
  sourcemap: false,
  assets: "assets",
  public: "public",
  exportPathMap: null,
};

class Writeable {
  constructor(content) {
    this.content = content;
  }

  save(filepath) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    return fs.writeFileSync(filepath, this.content);
  }
}

class Template {
  constructor(path) {
    this.path = path;
    this.template = this.load(this.path);
  }

  load() {
    return fs.readFileSync(this.path).toString();
  }

  render(data) {
    return new Writeable(ejs.render(this.template, data));
  }
}

class Build {
  constructor(config) {
    this.config = config;
    this.id = this.generateId();
    this.entrypointsDir = `${config.cwd}/.sven/${this.id}/entrypoints`;
  }

  generateId() {
    return nanoid();
  }
}

const createEntrypoint = (page) => {
  const template = new Template(
    path.join(__dirname, "./templates/entrypoint.ejs")
  );
  const source = template.render({
    path: page.src,
    target: "document.body",
  });

  source.save(page.entrypoint);
};

const createPage = ({ build, page }) => {
  const template = new Template(path.join(__dirname, "./templates/page.ejs"));
  const source = template.render({
    title: page.resource.replace("/", " ").trim(),
    scripts: {
      css: `/assets${page.resource}/main.css`,
      js: `/assets${page.resource}/main.js`,
    },
  });
  source.save(`${build.config.out}${page.resource}/index.html`);
};

export const sven = async (options = {}) => {
  const config = Object.assign({}, defaultConfig, options);
  const build = new Build(config);
  const pages = await gatherPages({ build });

  return pages.map((page) => {
    const entryName = trimPrefix(
      `${trimPrefix(page.resource, "/")}/main.js`,
      "/"
    );

    createEntrypoint(page);
    createPage({ build, page });

    return {
      input: page.entrypoint,

      output: {
        sourcemap: config.sourcemap,
        format: "esm",
        entryFileNames: entryName,
        chunkFileNames: entryName,
        dir: `${config.out}/assets`,
      },

      plugins: [
        svelte({
          dev: !config.production,
          css: (css) => {
            css.write(
              trimPrefix(`${trimPrefix(page.resource, "/")}/main.css`, "/"),
              config.sourcemap
            );
          },
        }),

        resolve(),
        commonjs(),
        replace({
          "process.env.NODE_ENV": JSON.stringify(
            config.production ? "production" : "development"
          ),
        }),
        config.production && terser(),
      ],

      watch: {
        clearScreen: false,
      },
    };
  });
};

export default sven({
  production: !process.env.ROLLUP_WATCH,
  cwd: path.join(__dirname, ".."),
});
