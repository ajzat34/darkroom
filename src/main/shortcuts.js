var bindings = {
  48: function(){viewreset()},   // 0
  49: function(){viewabs(1)},    // 1
  50: function(){viewabs(2)},    // 2
  51: function(){viewabs(4)},    // 3

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
