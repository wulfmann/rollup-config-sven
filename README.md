# sven

sven is a small static site generator for svelte.

it purposesfully implements a small number of features. if you have a complex use-case, it may be better to evsluate one of these:

- sapper
- elder

## API

sven is a glorified rollup config generator. it performs the following steps:

- generates entrypoints for every .svelte file in the pages directory
- generates a .js file for every entrypoint into the assets directory
- generates a .html file for each entrypoint into the public directory
- generates a .css file for every entrypoint into the assets directory

## Options

- clean urls
- hashed filenames
