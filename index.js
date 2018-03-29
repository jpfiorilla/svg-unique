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

const collectClasses = childs => {
  let classes = [];
  childs.forEach(child => {
    if (child.attrs.class && !classes.includes(child.attrs.class))
      classes.push(child.attrs.class);
    if (child.childs) {
      classes = [...classes, ...collectClasses(child.childs)];
    }
  });
  return classes;
};

const generateIdMap = ids => {
  const idMap = {};
  ids.forEach(id => {
    idMap[id] = uuid();
  });
  return idMap;
};

const generateClassMap = classes => {
  const classMap = {};
  classes.forEach(className => {
    classMap[className] = uuid();
  });
  return classMap;
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

const replaceClasses = (file, classMap) => {
  let newFile = file;
  Object.keys(classMap).forEach(
    className =>
      (newFile = newFile
        .replaceAll(`class="${className}"`, `class="${classMap[className]}"`)
        .replaceAll(`#${className}`, `#${classMap[className]}`))
  );
  return newFile;
};

const saveFile = (fileName, inputPath, outputPath) => {
  if (!fileName) return;
  const file = readFile(fileName, inputPath);
  return svgson(file, {}, result => {
    const ids = collectIds(result.childs);
    const classes = collectClasses(result.childs);
    if (ids.length === 0 && classes.length === 0) {
      console.log(
        `${outputPath}/${fileName} was not rewritten as it contains no id or class attributes.`
      );
      return;
    }
    const idMap = generateIdMap(ids);
    const classMap = generateClassMap(classes);
    const newFile = replaceClasses(replaceIds(file, idMap), classMap);
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

saveFolder(options.input || '.', options.output || options.input || '.');
