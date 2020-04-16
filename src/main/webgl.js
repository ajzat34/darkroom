const fs = require('fs')

function getWebGL (canvas) {
  var gl = canvas.getContext("webgl2")
  if (gl && gl instanceof WebGL2RenderingContext) {
    return gl
  } else {
    return null
  }
}

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

  // texturemap buffer
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

// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                new Uint8Array([0, 0, 0, 0]));

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    eventImageLoad(image)
  };
  image.src = url;

  return texture;
}

function draw (gl) {
  gl.clear(gl.COLOR_BUFFER_BIT)
  const offset = 0;
  const vertexCount = 6;
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

function isPowerOf2(value) {
 return (value & (value - 1)) == 0;
}
