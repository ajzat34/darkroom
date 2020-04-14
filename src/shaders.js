function loadShaderPack (gl, path, descriptor) {
  var shaderprogram = loadShaderProgram(gl, path)
  var pack = {
    gl: shaderprogram,
    attribLocations: {
      aVertex: gl.getAttribLocation(shaderprogram, descriptor.atrribVertexCoord),
      textureCoord: gl.getAttribLocation(shaderprogram, descriptor.atrribTextureCoord),
    },
    uniformLocations: {
      texture: gl.getUniformLocation(shaderprogram, descriptor.textureSampler),
    },
  }
  if (descriptor.uniforms) {
    Object.keys(descriptor.uniforms).forEach((key) => {
      pack.uniformLocations[key] = gl.getUniformLocation(shaderprogram, descriptor.uniforms[key])
    })
  }
  return pack
}
