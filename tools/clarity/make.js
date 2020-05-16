const genGLSL = require('./shader.js')
const fs = require('fs');

fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_h16/frag.glsl', genGLSL(16,0))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_v16/frag.glsl', genGLSL(16,1))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_h32/frag.glsl', genGLSL(32,0))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_v32/frag.glsl', genGLSL(32,1))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_h64/frag.glsl', genGLSL(64,0))
fs.writeFileSync(__dirname + '/../../src/main/shaders/gaussian_v64/frag.glsl', genGLSL(64,1))
