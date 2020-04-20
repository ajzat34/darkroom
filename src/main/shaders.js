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
    descriptor.inputBindings.forEach((key, i) => {
      pack.imageBindings[key] = gl.getUniformLocation(shaderprogram, descriptor.inputBindings[i])
    })
  }
  pack.imageBindingsMappings = descriptor.inputBindings
  if (descriptor.textures) {
    pack.textures = {}
    descriptor.textures.forEach((texture) => {
      pack.textures[texture] = newGlTexture(gl)
      pack.imageBindings[texture] = gl.getUniformLocation(shaderprogram, texture)
      pack.imageBindingsMappings.push(texture)
    })
  }
  return pack
}
