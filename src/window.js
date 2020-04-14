const remote = require('electron').remote

var preview
var pc
var pgl
var options

var optionsSize = 300

var model
var copyprogram

function resize () {
  options.style.width = `${optionsSize}px`
  preview.style.width = `${window.innerWidth - optionsSize}px`
  pc.width = (window.innerWidth - optionsSize) * window.devicePixelRatio
  pc.height = window.innerHeight * window.devicePixelRatio
  pc.style.width = `${window.innerWidth - optionsSize}px`
  pc.style.height = `${window.innerHeight}px`
  glResize(pgl)
  render(pgl)
}

function loadGL (gl) {
  model = prepareModelBuffer(gl)
  sourceImage = loadTexture(gl, 'image.jpg')
  copyprogram = loadShaderPack(gl, __dirname + '/shaders/copy', {
    atrribVertexCoord: 'aVertex',
    atrribTextureCoord: 'aTextureCoord',
    textureSampler: 'texSampler',
  })
}

function render (gl) {
  gluse(gl, copyprogram, model, sourceImage)
  draw(gl)
}

document.addEventListener("DOMContentLoaded", function(){
  // window panes
  preview = document.getElementById('preview-pane')
  options = document.getElementById('options-pane')

  // webgl / preview canvas
  pc = document.getElementById('preview_canvas')
  pgl = getWebGL(pc)
  if (!pgl) {
    alert('WebGL is not supported')
    remote.getCurrentWindow().close()
    return
  }

  // initial sizing
  loadGL(pgl)
  resize()
  // and an eventlistener for resizing
  window.addEventListener('resize', resize)
})
