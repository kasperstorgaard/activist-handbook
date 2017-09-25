const {join} = require('path');
const chokidar = require('chokidar');
const {argv} = require('yargs');

const {rollup} = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');

const storesDir = join(__dirname, '../src/stores');

async function build() {
  const bundle = await rollup({
    input: join(storesDir, 'stores.js'),
    plugins: [
      commonjs(),
      nodeResolve({
        jsnext: true,
        main: true,
        module: true
      }),
      globals(),
      builtins()]
  });

  // generate code and a sourcemap
  await bundle.write({
    file: join(storesDir, 'stores.built.js'),
    format: 'iife',
    name: 'Stores',
    sourcemap: true
  });
}

build();
if (argv.watch) {
  chokidar.watch(join(storesDir, '/**/*.js'), {ignored: /\.(spec|built)\.js/})
    .on('change', () => build());
}
