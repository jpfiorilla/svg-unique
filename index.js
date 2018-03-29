const uuid = require('uuid/v4');
const svgson = require('svgson');
const fs = require('fs');
require.extensions['.txt'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const readFile = (fileName = 'add') => {
  const path = `./input/${fileName}${fileName.includes('.') ? '' : '.svg'}`;
  const string = fs.readFileSync(path, 'utf-8', (err, data) => {
    return svgson(
      data,
      {
        svgo: true,
        title: 'myFile',
        pathsKey: 'myPaths',
        customAttrs: {
          foo: true
        }
      }
      //   res => console.log(res)
    );
  });
  return string;
};

const collectIds = childs => {
  let ids = [];
  childs.forEach(child => {
    if (child.attrs.id && !ids.includes(child.attrs.id))
      ids.push(child.attrs.id);
    if (child.childs) {
      ids = [...ids, ...collectIds(child.childs)];
    }
  });
  return ids;
};

const generateIdMap = ids => {
  const idMap = {};
  ids.forEach(id => {
    idMap[id] = uuid();
  });
  return idMap;
};

String.prototype.replaceAll = function(search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

const replaceIds = (file, idMap) => {
  let newFile = file;
  Object.keys(idMap).forEach(
    id => (newFile = newFile.replaceAll(id, idMap[id]))
  );
  return newFile;
};

const saveFile = fileName => {
  if (!fileName) return;
  const file = readFile(fileName);
  console.log(file);
  return svgson(file, {}, result => {
    const { name, attrs, childs } = result;
    const ids = collectIds(childs);
    if (ids.length === 0) return;
    const idMap = generateIdMap(ids);
    const newFile = replaceIds(file, idMap);
    console.log(newFile);
    // return newFile;
    return fs.writeFile(`./output/${fileName}.svg`, newFile, err => {
      if (err) return console.log(err);
      console.log('The file was saved!');
    });
  });
};

saveFile('add');
