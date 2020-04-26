var bindings = {
  27: function(){viewMode()},    // esc

  219: function(){if(controlmode==='editmask') brushD()},     // [
  221: function(){if(controlmode==='editmask') brushI()},     // ]
}

document.getElementById('btn-view-reset').addEventListener('click',function(){viewreset()})
document.getElementById('btn-view-1').addEventListener('click',function(){viewabs(1)})
document.getElementById('btn-view-2').addEventListener('click',function(){viewabs(2)})
document.getElementById('btn-view-3').addEventListener('click',function(){viewabs(4)})

document.getElementById('btn-maskedit-exit').addEventListener('click',function(){viewMode()})

document.onkeyup = function(e) {
  Object.keys(bindings).forEach((binding) => { if (e.which == binding) bindings[binding]() })
}

function prepareShortcuts() {
  ipcRenderer.on('view-reset', function(){viewreset()})
  ipcRenderer.on('view-1', function(){viewabs(1)})
  ipcRenderer.on('view-2', function(){viewabs(2)})
  ipcRenderer.on('view-3', function(){viewabs(3)})
  ipcRenderer.on('view-4', function(){viewabs(4)})
  ipcRenderer.on('view-5', function(){viewabs(5)})

  ipcRenderer.on('export', function(){exportProject()})

  document.getElementById('btn-show-mask').addEventListener("mousedown", function(e) {
    updateCanvasMouseShowMask()
  })
  document.getElementById('btn-show-mask').addEventListener("mouseup", function(e) {
    updateCanvasMouse()
  })
}
