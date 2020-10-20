# sven

`sven` is a rollup config module.

```bash
npm i -g svelte rollup rollup-config-sven
```

`sven` is a small static site generator for [svelte](https://svelte.dev/).

It implements a very small number of features. If you have a complex use-case, it may be better to evsluate one of these:

- [sapper](https://sapper.svelte.dev/)
- [elder](https://github.com/Elderjs/elderjs)

## Quickstart

Add the following script to your `package.json` scripts section:

```json
"build": "rollup -c node:sven" 
```

## API

Under the hood, all `sven` is doing is dynamically generating rollup config. Here are the high-level steps it performs:

- generates an entrypoint for every `.svelte` file in the `pages` directory
- generates a `.js` file for every entrypoint into the `assets` directory
- generates a `.html` file for each entrypoint into the `public` directory
- generates a `.css` file for every entrypoint into the `assets` directory
