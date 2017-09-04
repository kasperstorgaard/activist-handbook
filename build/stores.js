const {statSync, readdirSync, writeFile} = require('fs');
const {join} = require('path');
const chokidar = require('chokidar');
const {argv} = require('yargs');
const {promisify} = require('util');

const {rollup} = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');

const storesDir = join(__dirname, '../src/stores');
const format = 'iife';

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
  const { code, map } = await bundle.generate({
    format: 'iife',
    name: 'Stores'
  });

  const content = 
  `<script>
   /** Generated from root.js by build/stores.js **/

   ${code.split(/\n/).join('\n  ')}

  </script>`;

  writeFile(join(storesDir, 'stores.html'), content);
};

build();
if (argv.watch) {
  chokidar.watch(join(storesDir, '/**/*.js'), {ignored: /\.spec\.js/})
    .on('change', (event, path) => build());
}
