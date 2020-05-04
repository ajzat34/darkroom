const genGLSL = require('./shader.js')
const fs = require('fs');

fs.writeFileSync(__dirname + '/../../src/main/shaders/nlmeans3/frag.glsl', genGLSL(1,1))
fs.writeFileSync(__dirname + '/../../src/main/shaders/nlmeans5/frag.glsl', genGLSL(1,2))
fs.writeFileSync(__dirname + '/../../src/main/shaders/nlmeans7/frag.glsl', genGLSL(1,3))
