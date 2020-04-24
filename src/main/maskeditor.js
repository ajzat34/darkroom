var editingMask // what mask is being edited at the moment
var lastmouse = [0,0]
var maskBrushSize = 16
var maskBrushValue = 0

var maskEditBrushSizeSlider = document.getElementById('range-editmask-brushsize')
var maskEditBrushSizeNumber = document.getElementById('number-editmask-brushsize')
var maskEditValueSlider = document.getElementById('range-editmask-value')
var maskEditValueNumber = document.getElementById('number-editmask-value')
updateMaskSlider()

function getGlNormalCoord(c) {
  var width = calcCanvasSizeWidth()
  var height = calcCanvasSizeHeight()
  var offset = [(scroll[0])/(width/2), (scroll[1])/(height/2)]
  var aspectFactor = (framebuffers.final.width/framebuffers.final.height)/pcaspect
  var norm = [c[0]/width, (c[1]-toolbarSize)/height]
  var center = [(norm[0]-0.5)*2, (norm[1]-0.5)*2]
  var size = [center[0]/viewscale, center[1]*aspectFactor/viewscale]
  var move = [size[0]-offset[0], size[1]-offset[1]]
  return move
}

function brushI() {
  maskBrushSize *= 1.2
  updateMaskSlider()
}

function brushD() {
  maskBrushSize /= 1.2
  updateMaskSlider()
}

function isEditingMask() {
  return (controlmode === 'editmask')
}

function toggleEditingMask(mask) {
  if (isEditingMask() && editingMask === mask){
    stopEditingMask()
  } else {
    startEditingMask(mask)
  }
}

function startEditingMask(mask) {
  editingMask = mask
  controlmode = 'editmask'
  setContextualMode('editmask')
}

function stopEditingMask() {
  controlmode = 'view'
  setContextualMode('view')
}

function dist (a,b) {
  return Math.sqrt((a*a)+(b*b))
}

function distvec(a,b) {
  return dist(a[0]-b[0], a[1]-b[1])
}

function maskEditorTick() {
  if (controlmode === 'editmask' && mouse === 'down') {
    var dist = distvec(lastmouse, mosusepos)
    if (dist > 1) {
      stroke(mosusepos)
      lastmouse = mosusepos
    }
  }
}

function stroke(mosusepos) {
  var coord = getGlNormalCoord(mosusepos)
  editingMask.stroke(maskBrushSize, coord[0], coord[1], maskBrushValue)
  projectChange()
}

function updateMaskSlider() {
  maskEditBrushSizeSlider.value = maskBrushSize
  maskEditBrushSizeNumber.value = Math.round(maskBrushSize)
  maskEditValueSlider.value = maskBrushValue * 100
  maskEditValueNumber.value = Math.round(maskBrushValue * 100)
}

function maskEditorInput(from) {
  if (from==='slider-size') maskBrushSize = maskEditBrushSizeSlider.value
  else if (from==='number-size') maskBrushSize = maskEditBrushSizeNumber.value
  else if (from==='number-slider') maskBrushValue = maskEditValueSlider.value / 100
  else if (from==='number-value') maskBrushValue = maskEditValueNumber.value / 100
  updateMaskSlider()
}
