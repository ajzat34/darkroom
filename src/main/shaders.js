function loadShaderPack (gl, path, descriptor) {
  var shaderprogram = loadShaderProgram(gl, path)
  var pack = {
    gl: shaderprogram,
    attribLocations: {
      aVertex: gl.getAttribLocation(shaderprogram, descriptor.atrribVertexCoord),
      textureCoord: gl.getAttribLocation(shaderprogram, descriptor.atrribTextureCoord),
    },
    uniformLocations: {},
    imageBindings: {},
  }
  if (descriptor.uniforms) {
    Object.keys(descriptor.uniforms).forEach((key) => {
      pack.uniformLocations[key] = gl.getUniformLocation(shaderprogram, descriptor.uniforms[key])
    })
  }
  if (descriptor.inputBindings) {
    descriptor.inputBindings.forEach((key) => {
      pack.imageBindings[key] = gl.getUniformLocation(shaderprogram, descriptor.inputBindings[key])
    })
  }
  return pack
}
