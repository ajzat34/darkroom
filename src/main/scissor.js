function enableScissor(gl) {
  var wr = pc.width/ framebuffers.final.width
  var hr = pc.height/ framebuffers.final.height
  var ratioscale = Math.min(hr/wr,1)*viewscale

  var cw = calcCanvasSizeWidth()
  var ch = calcCanvasSizeHeight()
  var width = sourceImageWidth
  var height = sourceImageHeight
  var aspectFactor = (framebuffers.final.width/framebuffers.final.height)/pcaspect
  var hw = width/2
  var hh = height/2
  var w = (2*(cw/wr))/ratioscale
  var h = w/pcaspect
  var n = getGlNormalCoord([0,toolbarSize])
  var nx = ((n[0]+1)/2)*width
  var ny = ((n[1]+1)/2)*height
  console.log(nx,ny)
  var x = nx
  var y = ny
  console.log(x,y)
  gl.scissor(x-5,y-5,w+10,h+10)
  gl.enable(gl.SCISSOR_TEST)
}

function disableScissor(gl){
  gl.disable(gl.SCISSOR_TEST)
}
