function allocTextureFB (gl, width, height, linearFilter) {
  // allocate a texture to render to
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_2D, 0, webGLtextureInternalFormat, width, height, 0, webGLtextureFormat, webGLtextureType, null);
  // set the filtering
  if (linearFilter) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // create a framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  // attach the texture to the color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

  // return an object with all of the information about the framebuffer
  return {
    framebuffer: fb,
    texture: texture,
    width: width,
    height: height,
  }
}

function deleteFB (gl, fb) {
  gl.deleteFramebuffer(fb.framebuffer)
  gl.deleteTexture(fb.texture)
}

// makes a framebuffer active
function useFB (gl, fb) {
  if (fb) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.framebuffer)
    gl.viewport(0, 0, fb.width, fb.height)
    return
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
}
