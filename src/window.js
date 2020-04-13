var preview
var pcv
var ctx
var options

var optionsSize = 300

function resize () {
  options.style.width = `${optionsSize}px`
  preview.style.width = `${window.innerWidth - optionsSize}px`
  pcv.width = (window.innerWidth - optionsSize) * window.devicePixelRatio
  pcv.height = window.innerHeight * window.devicePixelRatio
}

document.addEventListener("DOMContentLoaded", function(){
  // window panes
  preview = document.getElementById('preview-pane')
  options = document.getElementById('options-pane')
  pcv = document.getElementById('preview_canvas')
  ctx = getWebGL(pcv)
  if (!ctx) {
    document.getElementsByTagName("BODY")[0].innerHTML = 'WebGL is not supported'
    throw new Error('WebGL is not supported')
    return
  }
  resize()
  window.addEventListener('resize', resize)
})
