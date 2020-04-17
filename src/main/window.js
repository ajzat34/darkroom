const { ipcRenderer, remote } = require('electron')
const dialog = remote.dialog

var preview
var pc
var pgl
var pcaspect
var options

var optionsSize = 320
var toolbarSize = 48

var sourceImageWidth = 2
var sourceImageHeight = 2

var renderquality = 1.0

var scroll = [0,0]
var mosusepos = [0,0]
var scale = 0.99
var viewscale = scale*scale
var mouse

var updateRequest = false
var renderRequest = false

var renderrate = 100

var widgetUiElements = []

function resize () {
  var width = window.innerWidth - optionsSize
  var height = window.innerHeight - toolbarSize
  options.style.width = `${optionsSize}px`
  preview.style.width = `${width}px`
  pc.width = (width) * window.devicePixelRatio
  pc.height = (height) * window.devicePixelRatio
  pc.style.width = `${width}px`
  pc.style.height = `${height}px`
  pcaspect = pc.width/pc.height
  glResize(pgl)
  sheduleUpdate()
}

function eventImageLoad (image) {
  sourceImageWidth = image.width
  sourceImageHeight = image.height
  triggerRecreateFrameBuffers(pgl)
  sheduleRender(pgl)
  ipcRenderer.send('mainwindow-loaded')
}

function mouseMoveHandler (e) {
  if (mouse === 'down'){
    deltaX = (e.clientX - mosusepos[0]) / viewscale
    deltaY = (e.clientY - mosusepos[1]) / viewscale
    scroll = [scroll[0]+deltaX, scroll[1]+deltaY]
    mosusepos = [e.clientX, e.clientY]
    sheduleUpdate()
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
  sheduleUpdate()
}

function createWidgetUIs() {
  widgetUiElements = []
  widgetOrder.forEach((widgetname) => {
    var widget = widgets[widgetname]
    var w = createWidgetUi(options, widget)
    w.onchange = function(data) {
      Object.keys(widget.knobs).forEach((knob) => {
        widget.knobs[knob].value = data[knob]
      })
      sheduleRender()
    }
  })
}

document.addEventListener("DOMContentLoaded", function(){

  // macos buttons
  document.getElementById("min-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       window.minimize()
  })
  document.getElementById("max-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       if (!window.isMaximized()) {
           window.maximize()
       } else {
           window.unmaximize()
       }
  })
  document.getElementById("close-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       window.close();
  })

  document.getElementById('btn-compare').addEventListener("mousedown", function(e) {
    updateCanvasMouseCompare()
  })
  document.getElementById('btn-compare').addEventListener("mouseup", function(e) {
    updateCanvasMouse()
  })

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

  updateCycle()
  canvasUpdateCycle()
})


// ------ rendering
function updateCycle () {
  var start = new Date()
  pgl.finish()
  if (renderRequest) {
    renderRequest = false
    render(pgl)
    pgl.finish()
    sheduleUpdate()
  }
  pgl.finish()
  // console.log(new Date()-start)
  setTimeout(function(){ requestAnimationFrame(updateCycle) }, renderrate-(new Date() - start))
}

function canvasUpdateCycle () {
  var start = new Date()
  if (updateRequest){
    updateRequest = false
    updateCanvasMouse()
  }
  pgl.finish()
  setTimeout(function(){ requestAnimationFrame(canvasUpdateCycle) } )
}

function sheduleRender() {
  renderRequest = true
}

function sheduleUpdate() {
  updateRequest = true
}

function updateCanvasMouse () {
  var width = window.innerWidth - optionsSize
  var height = window.innerHeight
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale, framebuffers.final.texture)
}

function updateCanvasMouseCompare () {
  var width = window.innerWidth - optionsSize
  var height = window.innerHeight
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale, sourceImage)
}
