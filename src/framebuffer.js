function allocTextureFB (gl, width, height) {
  // allocate a texture to render to
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // create a frambuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // attach the texture to the color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

  return {
    frambuffer: fb,
    texture: texture,
    width: width,
    height: height,
  }
}

function deleteFB (gl, fb) {
  gl.deleteFramebuffer(fb.frambuffer)
  gl.deleteTexture(fb.texture)
}

function useFB (gl, fb) {
  if (fb) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.frambuffer);
    gl.viewport(0, 0, fb.width, fb.height);
    return
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
}
