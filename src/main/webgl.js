// gets the webgl2 rendering context from a canvas
function getWebGL (canvas) {
  var gl = canvas.getContext("webgl2")
  if (gl && gl instanceof WebGL2RenderingContext) {
    return gl
  } else {
    return null
  }
}

// resize to the viewport
function glResize (gl) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
}


// shader and program loading
function loadShader (gl, path, type) {
  // load the file
  var source
  try {
    source = fs.readFileSync(path)
  } catch (err) {
    throw new Error(`unable to load source file for shader ${path}` + err)
    return null
  }
  // create the shader
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  // check for errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('shader compile error: ' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// load shaders from <path>/vert.glsl & <path>/frag.glsl
// returns a shaderprogram
function loadShaderProgram (gl, path) {
  // load the shaders
  const vert = loadShader(gl, `${path}/vert.glsl`, gl.VERTEX_SHADER)
  const frag = loadShader(gl, `${path}/frag.glsl`, gl.FRAGMENT_SHADER)

  // create a program
  const program = gl.createProgram()
  // attach the shaders
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)

  // check for errrors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('program initialization error' + gl.getProgramInfoLog(program))
    return null
  }

  return program
}

function prepareModelBuffer (gl) {
  // vertex
  var vbuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rect.vertex), gl.STATIC_DRAW)

  // texture
  var tbuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rect.texture), gl.STATIC_DRAW)

  return {
    vertex: vbuffer,
    texture: tbuffer,
  }
}

function gluse (gl, program, model) {
  // vertex buffer
  {
    const numComponents = 2;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertex);
    gl.vertexAttribPointer( program.attribLocations.aVertex, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray( program.attribLocations.aVertex )
  }

  // texture map buffer
  {
    const num = 2;            // every coordinate composed of 2 values
    const type = gl.FLOAT;    // the data in the buffer is 32 bit float
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set to the next
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texture);
    gl.vertexAttribPointer(program.attribLocations.textureCoord, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(program.attribLocations.textureCoord);
  }

  gl.useProgram(program.gl)
}

function useTextures(gl, program, textures) {
  textures.forEach((texture, i) => {
    gl.activeTexture(gl[`TEXTURE${i}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(program.imageBindings[program.imageBindingsMappings[i]], i)
  })
}

function newGlTexture(gl){
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture
}

function loadTextureData(gl, texture, width, height, data, alignment) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  if (alignment) gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment)
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                data)
}

// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
function loadTexture(gl, internalFormat, srcFormat, srcType, imageFormat, imageData, callback, filter) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 1, 1, 0, srcFormat, srcType, null);

  loadImageBase64(imageFormat, imageData, function(image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, image);
    if (callback) callback(image)
  })

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (filter) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  }

  return texture;
}

function loadTexturePath(gl, internalFormat, srcFormat, srcType, path, callback, filter){
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
                1, 1, 0, srcFormat, srcType,
                null);

  loadImage(path, function(image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, image);
    if (callback) callback(image)
  })

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (filter) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  }
  return texture;
}

// same as above but accepts an array
function loadTextureArray(gl, internalFormat, srcFormat, srcType, width, height, data, callback, filter) {
  const texture = gl.createTexture();
  setTimeout(function(){
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, srcFormat, srcType, data, 0);
    callback({width: width, height: height})
  },0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (filter) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  }
  return texture;
}

// draws the model with the current program and framebuffers
function draw (gl, scissor) {
  gl.disable(gl.BLEND)
  if (scissor) enableScissor(gl)
  else disableScissor(gl)
  gl.clearColor(0,0,0,0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const offset = 0;
  const vertexCount = 6;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

// draws without clearing
function pushDraw(gl) {
  disableScissor()
  const offset = 0;
  const vertexCount = 6;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

// clear the canvas
function clearNow(gl){
  disableScissor(gl)
  gl.clearColor(0,0,0,0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

function isPowerOf2(value) {
 return (value & (value - 1)) == 0;
}

// downloads data from a framebuffer
function donwloadFramebuffer(gl, framebuffer) {
  var imgdata = new ImageData(framebuffer.width, framebuffer.height)
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer)
  gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA, gl.UNSIGNED_BYTE, imgdata.data)
  return imgdata
}

// return a dataURL string from a framebuffer
function framebufferToBlob(gl, format, framebuffer, opt) {
  var p = new Promise(function(resolve, reject){
    var data = donwloadFramebuffer(gl, framebuffer)
    var canvas = document.createElement("canvas")
    canvas.width = framebuffer.width
    canvas.height = framebuffer.height
    var ctx = canvas.getContext("2d")
    ctx.putImageData(data, 0, 0);
    // remove this
    // document.body.appendChild(canvas)
    var callback = function(blob) {
      resolve(blob)
    }
    if (format === "PNG") {
      canvas.toBlob(callback, "image/png")
    } else if (format === "JPEG") {
      if (opt && opt.quality) {
        canvas.toBlob(callback, "image/jpeg", opt.quality)
      } else {
        canvas.toBlob(callback, "image/jpeg")
      }
    } else if (format === "TIFF") {
      CanvasToTIFF.toBlob(canvas, callback)
    }
  })
  return p
}

// sets a callback for a webgl fence to finish
function callbackGlFence(gl, sync, callback, rate) {
  if (gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED) {
    callback()
  } else {
    setTimeout(function(){
      callbackGlFence(gl, sync, callback)
    }, rate)
  }
}

// promise wrapper for callbackGlFence
function asyncGlFence(gl, sync, rate) {
  return new Promise(function(resolve, reject) {
    callbackGlFence(gl, sync, function(){
      resolve()
    }, rate)
  })
}

// wrapper for many kinds of webgl2context.unifomXX and webgl2context.textureXX
function glSetUniformOrTextureData (gl, shader, bind, type, setdata){
  switch (type) {
    case 'float':
      gl.uniform1f(shader.glshaderpack.uniformLocations[bind], setdata)
      break;
    case 'vec4':
      gl.uniform4f(shader.glshaderpack.uniformLocations[bind], setdata[0], setdata[1], setdata[2], setdata[3])
      break;
    case 'vec3':
      gl.uniform3f(shader.glshaderpack.uniformLocations[bind], setdata[0], setdata[1], setdata[2])
      break;
    case 'floatarray':
      gl.uniform1fv(shader.glshaderpack.uniformLocations[bind], setdata)
      break;
    case 'int':
      gl.uniform1i(shader.glshaderpack.uniformLocations[bind], setdata)
      break;
    case 'ivec2':
      gl.uniform2i(shader.glshaderpack.uniformLocations[bind], setdata[0], setdata[1])
      break;
    case 'bool':
      if (setdata) {
        gl.uniform1i(shader.glshaderpack.uniformLocations[bind], 1)
      } else {
        gl.uniform1i(shader.glshaderpack.uniformLocations[bind], 0)
      }
      break;
    case 'texture':
      loadTextureData(gl, shader.glshaderpack.textures[bind], setdata.width, setdata.height, setdata.data, setdata.format, setdata.alignment)
      break;
    default:
      throw new Error (`unknown type ${value.type} in binding for knob ${key} in widget shader ${shaderidx}:${shader.shadername}`)
  }
}
