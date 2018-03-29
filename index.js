const uuid = require('uuid/v4');
const svgson = require('svgson');
const mkdirp = require('mkdirp');
const commandLineArgs = require('command-line-args');
const fs = require('fs');

const readFile = (fileName, inputPath) => {
  if (!fileName || !inputPath) return;
  const path = `${inputPath}/${fileName}`;
  const string = fs.readFileSync(path, 'utf-8');
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
    id =>
      (newFile = newFile
        .replaceAll(`id="${id}"`, `id="${idMap[id]}"`)
        .replaceAll(`#${id}`, `#${idMap[id]}`))
  );
  return newFile;
};

const saveFile = (fileName, inputPath, outputPath) => {
  if (!fileName) return;
  const file = readFile(fileName, inputPath);
  return svgson(file, {}, result => {
    const { name, attrs, childs } = result;
    const ids = collectIds(childs);
    if (ids.length === 0) return;
    const idMap = generateIdMap(ids);
    const newFile = replaceIds(file, idMap);
    return mkdirp(outputPath, err => {
      if (err) console.log(err);
      return fs.writeFile(`${outputPath}/${fileName}`, newFile, err => {
        if (err) return console.log(err);
        console.log(`${outputPath}/${fileName} was saved!`);
      });
    });
  });
};

const isSvg = fileName =>
  fileName.substring(fileName.lastIndexOf('.')) === '.svg';

const saveFolder = (inputPath, outputPath) =>
  fs.readdir(inputPath, (err, files) => {
    if (
      !files ||
      files.length === 0 ||
      files.filter(file => isSvg(file)).length === 0
    ) {
      console.log(
        `${
          inputPath === '.' ? 'This folder' : inputPath
        } contains no .svg files.`
      );
      return;
    }
    return files.forEach(file => {
      if (isSvg(file)) saveFile(file, inputPath, outputPath);
    });
  });

const options = commandLineArgs([
  {
    name: 'input',
    type: String
  },
  {
    name: 'output',
    type: String
  }
]);

saveFolder(options.input || '.', options.output || '.');
