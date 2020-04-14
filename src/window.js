const remote = require('electron').remote

var preview
var pc
var pgl
var pcaspect
var options

var optionsSize = 300

var sourceImageWidth = 2
var sourceImageHeight = 2

var renderquality = 1.0

var scroll = [0,0]
var mosusepos = [0,0]
var scale = 0.99
var viewscale = scale*scale
var mouse

function resize () {
  var width = window.innerWidth - optionsSize
  var height = window.innerHeight
  options.style.width = `${optionsSize}px`
  preview.style.width = `${width}px`
  pc.width = (width) * window.devicePixelRatio
  pc.height = (height) * window.devicePixelRatio
  pc.style.width = `${width}px`
  pc.style.height = `${height}px`
  pcaspect = pc.width/pc.height
  glResize(pgl)
  updateCanvasMouse()
}

function updateCanvasMouse () {
  var width = window.innerWidth - optionsSize
  var height = window.innerHeight
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale)
}

function eventImageLoad (image) {
  sourceImageWidth = image.width
  sourceImageHeight = image.height
  triggerRecreateFrameBuffers(pgl)
  render(pgl)
}

function mouseMoveHandler (e) {
  if (mouse === 'down'){
    deltaX = (e.clientX - mosusepos[0]) / viewscale
    deltaY = (e.clientY - mosusepos[1]) / viewscale
    scroll = [scroll[0]+deltaX, scroll[1]+deltaY]
    mosusepos = [e.clientX, e.clientY]
    updateCanvasMouse()
  }
}

function mouseDownHandler (e) {
  mosusepos = [e.clientX, e.clientY]
  mouse = 'down'
}

function mouseUpHandler () {
  mouse = 'up'
}

function mouseWheelHandler (e) {
  scale -= e.wheelDelta/5000
  scale = Math.max(Math.min(scale, 50), 0.1)
  viewscale = scale*scale
  updateCanvasMouse()
}

document.addEventListener("DOMContentLoaded", function(){
  // window panes
  preview = document.getElementById('preview-pane')
  options = document.getElementById('options-pane')

  // webgl / preview canvas
  pc = document.getElementById('preview_canvas')
  pc.addEventListener('mousedown', mouseDownHandler)
  window.addEventListener('mouseup', mouseUpHandler)
  window.addEventListener('mousemove', mouseMoveHandler)
  pc.addEventListener("mousewheel", mouseWheelHandler, false);
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
