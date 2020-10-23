![Banner](docs/images/banner.jpg)

# sven

`sven` is a minimal static site generator for [svelte](https://svelte.dev/). It aims to implement the following use-case:

- Generate static files from svelte components (treated as routes)
- Split common css/js files into the bundle
- Allow for asset caching

If you have a more advanced use-case you may want to evaluate one of the following:

- [sapper](https://sapper.svelte.dev/)
- [elder](https://github.com/Elderjs/elderjs)

## Quickstart

Created a new `index.svelte` file in a `pages` directory:

```html
<main>Home</home>
```

`sven` requires both `svelte` and `rollup` as peer dependencies.

```bash
$ yarn add svelte rollup rollup-config-sven -D
```

After you've installed the dependencies, you can run the build with:

```bash
$ npx rollup -c node:sven
```

You should now have a `public` directory containing your static files!

Check out the [example](/example) for a more advanced example.

## Overview

`sven` is built on rollup, and uses the following strategy:

### Routing

`sven` uses the filesystem to define routing. All svelte components found in the <pagesDir> are treated as individual routes.

Each svelte component is treated as an individual app. An entrypoint is dynamically generated as a [virtual module](https://github.com/rollup/plugins/tree/master/packages/virtual) at compile-time and used as the rollup input.

This is processed by a variety of rollup plugins that perform the following steps for each detected route:

- Compile Svelte Component
- Generate files for the css and js chunks from the component
- Generate an HTML file with links to these chunks.

This leaves you with a deployable static site in the <outDir>.

### Asset Bundling Strategy

Paths in the <commonStyles> array are bundled into a common stylesheet. Any component that imports one of these paths will result in a link being added to the generated HTML file.

Example:

```
styles/common.css -> assets/common.[hash].css
```

Any CSS or Javascript that is parsed from the svelte component is emitted as a chunk in the <assetDir> under the path of the route.

Example:

```
admin/dashboard.svelte -> assets/admin/dashboard/[hash].css
admin/dashboard.svelte -> assets/admin/dashboard/[hash].js
```

Svelte itself is also treated as an external module so that it can be cached across routes. It is generated into `assets/svelte.[hash].js` and linked in all resulting HTML files.

## Configuration

You can modify the `sven` configuration with a `sven.config.js`.

You can view the default config [here](/lib/config.ts).

```js
module.exports = {
  /**
   * Set the output directory
   */ 
  outDir: 'public',

  /**
   * Set the asset directory.
   * All css and js files are put here
   */ 
  assetDir: 'assets',

  /**
   * Set the pages directory.
   * All .svelte files in this directory are used as individual
   * routes
   */ 
  pagesDir: 'pages',

  /**
   * Set the static assets directory.
   * Files in this directory are copied to the <outDir>
   */
  staticDir: 'static',

  /**
   * Enables clean urls.
   * Nested routes will use their name as a directory name and
   * will have an index.html created inside.
   * 
   * Example:
   * 
   * about.svelte -> about/index.html
   */ 
  cleanUrls: true,

  /**
   * Sets a list of paths to be bundled under a common.[hash].css file
   */
  commonStyles: ['styles/common.css'],
  
  /**
   * Enables production optimizations
   */ 
  production: process.env.NODE_ENV === "production" || !process.env.ROLLUP_WATCH,

  /**
   * Enables source map generation
   */ 
  sourceMaps: !production,

  /**
   * This object is passed directly into the rollup-plugin-svelte function
   */ 
  svelteConfig: {
    emitCss: true
  }
}
```

## Development

Install dependencies:

```bash
$ yarn
```

Run in development mode:

```bash
$ yarn dev
```

Build:

```bash
$ yarn build
```
