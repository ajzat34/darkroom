const { ipcRenderer, remote } = require('electron')
const dialog = remote.dialog
const nodepath = require('path')
const TIFF = require(nodepath.join(__dirname + '/tiff/index.js'))
const fs = require('fs')

// preview pane
var preview     // preview pane element (the big one on the left)
var pc          // preview canvas
var pgl         // preview canvas webgl2 context
var pcaspect    // preview canvas aspect ratio

// options bar
var options             // options pane element
var optionsSize = 310   // width of the options pane

// height of the top toolbar
var toolbarSize = 56

// width and height of the image
// this gets changed when the image is loaded
var sourceImageWidth = 2
var sourceImageHeight = 2

// viewport data
var scroll = [0,0]             // current window scroll
var mosusepos = [0,0]
var scale = 0.99               // current zoom amount
var viewscale = scale*scale    // the render scale = zoom^2
var mouse                      // is the mouse up or down

var controlmode = 'view'       // how should main viewport input be interperated

var contextualMode = 'view'    // mode of the contextualMenu
var contextual                 // dom element for contextual menu

var updateRequest = false      // set to when signalling that the image needs to be re-rendered
var renderRequestIndex = 0     // the index in renderPasses to start on
var fullRenderIndex = 0
var renderRequest = false      // same for canvas updates

var widgetUiElements           // array of widgets (collections of dom elements)

var renderTimeStat = 0         // stores how long the last render took
var lastRender

var envdata   // data about the environment

// override macos natural scrolling reversal
// this will be a preference later
var normalscroll = false

// holds to global state of all adjustments (widget knobs)
var widgetState = {}

// tool tip settings
var useToolTips = true  // should tools tips be created (must be set before loading widgetUI)
var toolTipDelay = 500 // delay before showing tool tips (in ms)

// autosave and undo history
var undoHistory = new UndoHistory(64) // holds the undo history
var historyTimer                      // timer to batch change events
var autosaveTimer                     // same as above, but for autosave

// webgl objects
var model             // holds the webgl object for the model
var copyprogram       // webgl shader program for
var widgets = {}      // holds the widget descriptors
var widgetOrder = ['nlmeans', 'saltnpepper', 'adjustments', 'clarity', 'details', 'blur', 'colormat', 'grayscale'] // order to apply widgets
var renderPasses = [
  ['nlmeans', 'saltnpepper'],
  ['adjustments','clarity'],
  ['details', 'blur', 'colormat', 'grayscale'],
]
var framebuffers = {} // holds all of the framebuffers (chain, final, extra)
var sourceImage       // texture with the source image

// image loading
var imageB64          // base64 encoded copy of the original image
var imageBuff         // buffer of the original image
var imageFormat       // what format (png, jpeg) was the original image in
var imagePath         // where was the loaded image located
var fileName          // name of image
var srcPackage        // holds a copy of the loaded dkg/dkr if one was loaded

function calcCanvasSizeWidth () {
  return window.innerWidth - optionsSize
}

function calcCanvasSizeHeight () {
  return window.innerHeight - toolbarSize - contextual.clientHeight
}

function resize () {
  var width = calcCanvasSizeWidth()
  var height = calcCanvasSizeHeight()
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

function viewreset() {
  scale = 0.99
  scroll = [0,0]
  scheduleUpdate()
}

function viewabs(n) {
  var wr = pc.width/ framebuffers.final.width
  var hr = pc.height/ framebuffers.final.height
  var fitscale = Math.min(wr, hr)
  scale = n/fitscale
  scheduleUpdate()
}

// callback when the image loads
async function eventImageLoad (image) {
  sourceImageWidth = image.width
  sourceImageHeight = image.height
  triggerRecreateFrameBuffers(pgl)

  // load the saved state
  if (srcPackage) {
    loadPackage(srcPackage, imagePath)
  }

  // create the initial history snapshot
  createHistorySnapshot()

  // start the render loop
  updateCycle()
  updateCanvasCycle()

  // shedule the first render
  scheduleRender()

  // wait for first render to finish
  await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 5)

  // wait for the paint then tell the main process to show this window
  window.requestAnimationFrame(function(){
    setTimeout(function(){
      ipcRenderer.send('mainwindow-loaded')
    }, 200)
  })
}

// when a raw file is detected
async function eventLoadRawImage() {
  ipcRenderer.send('loading-raw-image')
}

// callback for canvas event mousemove
// updates the canvas position and schedules an update when the mouse moves
function mouseMoveHandler (e) {
  if (mouse === 'down') {
    deltaX = (e.clientX - mosusepos[0]) / viewscale
    deltaY = (e.clientY - mosusepos[1]) / viewscale
    mosusepos = [e.clientX, e.clientY]
    if (controlmode === 'view' | e.ctrlKey) {
      scroll = [scroll[0]+deltaX, scroll[1]+deltaY]
      scheduleUpdate()
    } else {
      maskEditorTick(mosusepos)
    }
  }
}

function mouseDownHandler (e) {
  mouse = 'down'
  mosusepos = [e.clientX, e.clientY]
  if (controlmode === 'view' | e.ctrlKey) pc.style.cursor = "move"
  else maskEditorTick(mosusepos)
}

function mouseUpHandler () {
  pc.style.cursor = "default"
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

function setupButtonEvents() {
  // macOS button events
  // document.getElementById("min-btn").addEventListener("click", function (e) {
  //      var window = remote.getCurrentWindow();
  //      window.minimize()
  // })
  // document.getElementById("max-btn").addEventListener("click", function (e) {
  //      var window = remote.getCurrentWindow();
  //      if (!window.isMaximized()) {
  //          window.maximize()
  //      } else {
  //          window.unmaximize()
  //      }
  // })
  // document.getElementById("close-btn").addEventListener("click", function (e) {
  //      var window = remote.getCurrentWindow();
  //      window.close();
  // })

  // compare button events
  document.getElementById('btn-compare').addEventListener("mousedown", function(e) {
    updateCanvasMouseCompare()
  })
  document.getElementById('btn-compare').addEventListener("mouseup", function(e) {
    updateCanvasMouse()
  })
}

function gatherWindowData () {
  envdata = remote.getGlobal('envdata')
}

// entry point
document.addEventListener("DOMContentLoaded",
function(){
  window.addEventListener("error", function (e) { onError(e.error) })
  main()
})
function main () {

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
  if (!pgl) errorBox('WebGL2 not supported', 'It looks like your computer doesn\'t support OpenGL-ES 3.0 / WebGL2.', 'Try updating your computer, and making sure your graphics drivers are properly installed.')

  gatherWindowData()

  if (envdata.darwin === false) {
    var body = document.getElementsByTagName("BODY")[0]
    body.classList.add('notoolbar')
    toolbarSize = 24
  }

  // start loading assets
  prepare(pgl)

  // prepare the contextual menu
  loadContexts()
  setContextualMode('view')

  prepareShortcuts()

  // initial sizing
  resize()
  // and an eventlistener for resizing
  window.addEventListener('resize', resize)

  // listen for ipc for menu items
  ipcRenderer.on('undo', undo)
  ipcRenderer.on('redo', redo)
  ipcRenderer.on('save', saveProject)
  ipcRenderer.on('save-as', saveProjectAs)

  setupButtonEvents()
}

// displays a message when an error ocurs. handles closing on error, and show on error while loading
function errorBox(title, message, detail) {
  ipcRenderer.send('render-error')
  const response = dialog.showMessageBoxSync({
    type: 'error',
    buttons: ['Quit', 'Keep Going'],
    defaultId: 0,
    title: title,
    message: message,
    detail: detail,
  })
  switch (response) {
    case 0:
      remote.getCurrentWindow().close()
      break
  }
}

function onError(err) {
  errorBox('Error', 'Something went wrong!', err.toString())
}

// ------ rendering ------

// this is the main render loop
// the scheduleRender() function is used to
// notify this loop that a render needs to occur.
async function updateCycle () {
  // wait for the gpu finish
  await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 10)

  var start = new Date()

  if (fullRenderIndex>=0 && new Date() - lastRender > renderTimeStat+500 && !isMouseDown) {
    console.log('starting full render from ', fullRenderIndex)
    render(pgl, fullRenderIndex, false)
    await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 10)
    scheduleUpdate()
    fullRenderIndex = -1
    lastRender = new Date()
    console.log('full render took', (new Date()-start), 'ms')
    document.getElementById('statusicon').setAttribute('mode', 'success')
  } else if (renderRequest) {
    document.getElementById('statusicon').setAttribute('mode', 'danger')
    renderRequest = false
    fullRenderIndex = renderRequestIndex
    render(pgl, renderRequestIndex, true)
    renderRequestIndex = 0
    pgl.flush()
    // wait for the gpu finish
    await asyncGlFence(pgl, pgl.fenceSync(pgl.SYNC_GPU_COMMANDS_COMPLETE, 0), 10)
    scheduleUpdate()
    // record some stats
    lastRender = new Date()
    renderTimeStat = (new Date()-start)
    console.log('render took', renderTimeStat, 'ms')
  }
  // do it all over again at least 1ms later
  setTimeout(function(){
    requestAnimationFrame(updateCycle)
  }, 1)
}

// this is the canvas update loop
// scheduleUpdate() function is used to
// notify this loop that an update needs to occur.
async function updateCanvasCycle () {
    if (updateRequest) {
      updateRequest = false
      updateCanvasMouse()
    }
    // do it all over again at least 1ms later
    setTimeout(function(){
      requestAnimationFrame(updateCanvasCycle)
    }, 1)
}

// tell the above render loop to update the final image or canvas
function scheduleRender(index) { renderRequest = true; if (index) {renderRequestIndex = index} else {renderRequestIndex = 0} }
function scheduleUpdate() { updateRequest = true }

// TODO: add history
function projectChange(fromUndo, renderPassIndex) {
  if (!renderPassIndex) scheduleRender(0)
  else scheduleRender(renderPassIndex)
  historyEventProjectChanged(fromUndo)
}

// helper functions for calculating scrolling
function updateCanvasMouse () {
  viewscale = scale*scale
  var width = calcCanvasSizeWidth()
  var height = calcCanvasSizeHeight()
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale, framebuffers.final.texture)
}

function updateCanvasMouseCompare () {
  viewscale = scale*scale
  var width = calcCanvasSizeWidth()
  var height = calcCanvasSizeHeight()
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale, sourceImage)
}

// keep track of mouse
var isMouseDown = 0;
document.body.onmousedown = function() {
  isMouseDown = true;
}
document.body.onmouseup = function() {
  isMouseDown = false;
}
