function getWebGL (canvas) {
  var gl = canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl")
  if (gl && gl instanceof WebGLRenderingContext) {
    return gl
  } else {
    return null
  }
}
