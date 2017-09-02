const {statSync, readdirSync, writeFile} = require('fs');
const {join} = require('path');
const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const basePath = join(__dirname, 'src/api');

function flatten(src) {
  return src.reduce((items, item) => item instanceof Array ?
    flatten(items.concat(item)) :
    items.concat([item]), []);
}

function getDirs(path, prefix) {
  const contents = readdirSync(path);
  const topDirs = contents
    .map(item => join(path, item))
    .filter(filePath => statSync(filePath).isDirectory());

  const subDirs = flatten(topDirs.map(dir => getDirs(dir)));
  return topDirs.concat(subDirs).filter(Boolean);
}

const dirs = getDirs(basePath);

const format = 'iife';

dirs.forEach(async dir => {
  const dirName = dir.replace(basePath, '');

  const name = dirName.split('/').slice(1)
    .map(str => str[0].toUpperCase() + str.substr(1))
    .join('');

  try {
    const bundle = await rollup({
      input: join(dir, 'index.js'),
      plugins: [resolve(), commonjs()]
    });

    // generate code and a sourcemap
    const { code, map } = await bundle.generate({
      format: 'iife',
      name,
      external: [
        'redux',
        'redux-actions'
      ]
    });

    const content = `<script>${code}</script>`;
    writeFile(join(dir, 'index.html'), content);
  }
  catch(error)
  {
    console.log(error);
  }
});

