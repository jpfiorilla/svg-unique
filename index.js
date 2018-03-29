const uuid = require('uuid/v4');
const svgson = require('svgson');
const _ = require('lodash');
const fs = require('fs');
require.extensions['.txt'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const readFile = (fileName = 'add') => {
  const path = `./input/${fileName}${fileName.includes('.') ? '' : '.svg'}`;
  const string = fs.readFileSync(path, 'utf-8', (err, data) => {
    // console.log(err, data);
    return svgson(
      data,
      {
        svgo: true,
        title: 'myFile',
        pathsKey: 'myPaths',
        customAttrs: {
          foo: true
        }
      },
      function(result) {
        // console.log(result);
      }
    );
  });
  //   console.log(string);
  return string;
};

// readFile();
// console.log(readFile());
// svgson(readFile(), {}, result => console.log(result));

const collectIds = childs => {
  let ids = [];
  childs.forEach(child => {
    if (child.attrs.id && !ids.includes(child.attrs.id))
      ids.push(child.attrs.id);
    if (child.childs) {
      console.log(child);
      ids = [...ids, ...collectIds(child.childs)];
    }
  });
  return ids;
};

const editFile = (file = readFile()) => {
  console.log(file);
  svgson(file, {}, result => {
    const { name, attrs, childs } = result;
    console.log(childs);
    console.log('\n');
    console.log(childs[0].childs[0]);
    const ids = collectIds(childs);
    console.log('\n');
    console.log(ids);
  });
};

editFile();