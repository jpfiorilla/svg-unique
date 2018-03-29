## Edit your SVGs to have unique markup

Programs like Sketch output their .svg files with the same ids as each other by default, which causes them to override each other when multiple svgs are displayed on a webpage.

This repo solves this issue by renaming the attributes of all SVG elements to be unique.

`$ npm i --save svg-unique`
