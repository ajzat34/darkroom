const remote = require('electron').remote

var preview
var pc
var pgl
var options

var optionsSize = 300

var sourceImageWidth = 2
var sourceImageHeight = 2

function resize () {
  options.style.width = `${optionsSize}px`
  preview.style.width = `${window.innerWidth - optionsSize}px`
  pc.width = (window.innerWidth - optionsSize) * window.devicePixelRatio
  pc.height = window.innerHeight * window.devicePixelRatio
  pc.style.width = `${window.innerWidth - optionsSize}px`
  pc.style.height = `${window.innerHeight}px`
  glResize(pgl)
  updateCanvas(pgl)
}

function eventImageLoad (image) {
  sourceImageWidth = image.width
  sourceImageHeight = image.height
  triggerRecreateFrameBuffers(pgl)
  render(pgl)
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
  prepare(pgl)
  resize()
  // and an eventlistener for resizing
  window.addEventListener('resize', resize)
})
