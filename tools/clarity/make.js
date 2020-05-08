const genGLSL = require('./shader.js')
const fs = require('fs');

fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_h/frag.glsl', genGLSL(24,0))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_v/frag.glsl', genGLSL(24,1))
