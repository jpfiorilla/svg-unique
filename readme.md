# Edit your SVGs to have unique markup

Programs like Sketch output their .svg files with the same ids as each other by default, which causes the svgs to override each other's markup when multiple are displayed on a webpage.

This script solves this issue by renaming the `id` and `class` attributes of all SVG elements to be unique.

### Install:

`$ npm i -g svg-unique`

### Use:

`$ svgu`

or

`$ svgu --input=./customInputDir --output=./customOutputDir`

| Argument | Use                     | Default value |
| -------- | ----------------------- | ------------- |
| --input  | Custom input directory  | .             |
| --output | Custom output directory | --input       |
