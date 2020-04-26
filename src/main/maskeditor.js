var editingMask // what mask is being edited at the moment
var lastmouse = [0,0]
var maskBrushSize = 64
var maskBrushValue = 0
var maskBrushHardness = 1
var maskBrushOpacity = 100

var maskEditBrushSizeSlider = document.getElementById('range-editmask-brushsize')
var maskEditBrushSizeNumber = document.getElementById('number-editmask-brushsize')
var maskEditBrushHardnessSlider = document.getElementById('range-editmask-hardness')
var maskEditBrushHardnessNumber = document.getElementById('number-editmask-hardness')
var maskEditBrushOpacitySlider = document.getElementById('range-editmask-opacity')
var maskEditBrushOpacityNumber = document.getElementById('number-editmask-opacity')

var maskEditBrushValue = document.getElementById('radio-editmask-value')
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
  // squaring the opacity adjustment makes it feel more linear, as brush strokes overlap
  // multiply !maskEditBrushValue.checked by 1 to make false=1, and true=0
  editingMask.stroke(maskBrushSize, coord[0], coord[1], !maskEditBrushValue.checked*1, maskBrushHardness * 2, Math.pow(maskBrushOpacity / 100, 2))
  projectChange()
}

function updateMaskSlider() {
  maskEditBrushSizeSlider.value = maskBrushSize
  maskEditBrushSizeNumber.value = Math.round(maskBrushSize)
  maskEditBrushHardnessSlider.value = maskBrushHardness
  maskEditBrushHardnessNumber.value = Math.round(maskBrushHardness)
  maskEditBrushOpacitySlider.value = maskBrushOpacity
  maskEditBrushOpacityNumber.value = Math.round(maskBrushOpacity)
}

function maskEditorInput(from) {
  if (from==='slider-size') maskBrushSize = maskEditBrushSizeSlider.value
  else if (from==='number-size') maskBrushSize = maskEditBrushSizeNumber.value

  else if (from==='slider-hardness') maskBrushHardness = maskEditBrushHardnessSlider.value
  else if (from==='number-hardness') maskBrushHardness = maskEditBrushHardnessNumber.value

  else if (from==='slider-opacity') maskBrushOpacity = maskEditBrushOpacitySlider.value
  else if (from==='number-opacity') maskBrushOpacity = maskEditBrushOpacityNumber.value
  updateMaskSlider()
}

function updateCanvasMouseShowMask () {
  console.log(editingMask)
  viewscale = scale*scale
  var width = calcCanvasSizeWidth()
  var height = calcCanvasSizeHeight()
  updateCanvas(pgl, (scroll[0])/(width/2), (scroll[1])/(height/2), viewscale, editingMask.texture)
}
