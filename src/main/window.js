const { ipcRenderer, remote } = require('electron')
const dialog = remote.dialog
const fs = require('fs')

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

var widgetUiElements = []

var savebutton

var renderrate = 12
var renderTimeStat = 0

var envdata

// override macos natural scrolling
var normalscroll = false

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
  scheduleUpdate()
}

async function eventImageLoad (image) {
  sourceImageWidth = image.width
  sourceImageHeight = image.height
  triggerRecreateFrameBuffers(pgl)
  scheduleRender(pgl)
  // wait for first render to finish
  await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 10)
  // wait for the paint then tell the main process to show this window
  window.requestAnimationFrame(function(){
    setTimeout(function(){
      ipcRenderer.send('mainwindow-loaded')
    }, 200)
  })
}

function mouseMoveHandler (e) {
  if (mouse === 'down'){
    deltaX = (e.clientX - mosusepos[0]) / viewscale
    deltaY = (e.clientY - mosusepos[1]) / viewscale
    scroll = [scroll[0]+deltaX, scroll[1]+deltaY]
    mosusepos = [e.clientX, e.clientY]
    scheduleUpdate()
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
  // correct for macOS "natural scrolling"
  if (!envdata.darwin || normalscroll) {
    scale += e.wheelDelta/5000
  } else {
    scale -= e.wheelDelta/5000
  }
  scale = Math.max(Math.min(scale, 50), 0.1)
  viewscale = scale*scale
  scheduleUpdate()
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
      projectChange()
    }
    w.triggerUpdate()
  })
}

function setupButtonEvents() {
  // macOS button events
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

  // compare button events
  document.getElementById('btn-compare').addEventListener("mousedown", function(e) {
    updateCanvasMouseCompare()
  })
  document.getElementById('btn-compare').addEventListener("mouseup", function(e) {
    updateCanvasMouse()
  })
}

function gatherWindowData () {
  envdata = ipcRenderer.sendSync('request-environment-data')
}

document.addEventListener("DOMContentLoaded", function(){

  // get window panes
  preview = document.getElementById('preview-pane')
  options = document.getElementById('options-pane')

  // get buttons
  savebutton = document.getElementById('btn-save')

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

  gatherWindowData()

  // start loading assets
  prepare(pgl)
  // initial sizing
  resize()
  // and an eventlistener for resizing
  window.addEventListener('resize', resize)

  setupButtonEvents()

  // start the (check for) render loop
  updateCycle()
})


// ------ rendering ------

// this is the render loop
// the scheduleRender() and scheduleUpdate() functions are used to
// notify this loop that a render needs to occur.
async function updateCycle () {
  var start = new Date()
  var rendered = false
  if (renderRequest) {
    rendered = true
    renderRequest = false
    render(pgl)
    scheduleUpdate()
  }

  // this should help ensure that the render occurs before drawing it to the canvas
  // it is NOT a sync, it just tells the drivers to "encourage eager execution of enqueued commands"
  pgl.flush()

  if (updateRequest){
    updateRequest = false
    updateCanvasMouse()
  }

  // wait for the gpu finish
  await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 10)

  // record some stats
  renderTimeStat = (new Date()-start)
  if (rendered) {
    console.log('render took', renderTimeStat, 'ms')
  }

  // do it all over again
  requestAnimationFrame(updateCycle)
}

// tell the above render loop to update the final image or canvas
function scheduleRender() { renderRequest = true }
function scheduleUpdate() { updateRequest = true }

// TODO: add history
function projectChange() {
  scheduleRender()
  saveButtonWarning()
}

// helper functinos for calculating scrolling
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
