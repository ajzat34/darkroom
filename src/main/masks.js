// file for filter and layer masks

// overview
// mask object:
// - opengl framebuffer, for rendering mask into
// - opengl texture, for storing mask data
// - procedural genoration (ie step 1: create a stroke here), for undo history

var maxStrokeRadius = 64

var brushTexture = null
var brushProgram = null

function maskInit(gl) {
  brushTexture = loadTexturePath(gl, gl.RGBA, gl.RGBA, __dirname + '/brush/128.png', null, gl.LINEAR)

  // load the shader used for drawing the result to the viewport/canvas
  brushProgram = loadShaderPack(gl, __dirname + '/shaders/brush', {
    atrribVertexCoord: 'aVertex',
    atrribTextureCoord: 'aTextureCoord',
    uniforms: {
      'transform': 'transform',
      'texture': 'brushSampler',
      'value': 'value',
    }
  })
}

class Mask {
  constructor (gl, width, height) {
    this.width = width
    this.height = height

    // create the texure
    this.texture = newGlTexture(gl)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // create the framebuffer
    this.framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)

    // attach the texture to the color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.texture, 0)

    this.gl = gl
    this.strokes = []

    this.updateTimeout = null

    this.needsBake = true
    this.stagingPtr = 0
  }

  useFB() {
    useFB(this.gl, this)
  }

  clear() {
    this.useFB()
    this.gl.clearColor(1,1,1,1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  stroke(r,x,y,v) {
    this.strokes.push({radius: (r/128)*(128/this.height), x: x, y: y, value: v})
  }

  load(strokes) {
    this.strokes = strokes
    this.needsBake = true
  }

  bakeIf() {
    if (this.needsBake) this.bake()
    if (this.stagingPtr < this.strokes.length) this.update()
  }

  requestBake() {
    this.needsBake = true
  }

  update() {
    var gl = this.gl
    console.log('updating mask')
    // enable blending
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    // get the resources we need ready
    this.useFB()
    gluse(gl, brushProgram, model)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, brushTexture)
    gl.uniform1i(brushProgram.uniformLocations.texture, 0)
    for (; this.stagingPtr < this.strokes.length; this.stagingPtr++) {
      var stroke = this.strokes[this.stagingPtr]
      const transform = mat4.create()
      mat4.translate(transform, transform, [stroke.x,stroke.y,0])
      mat4.scale(transform, transform, [stroke.radius,stroke.radius*(this.width/this.height),1])
      gl.uniformMatrix4fv(brushProgram.uniformLocations.transform, false, transform)
      gl.uniform1f(brushProgram.uniformLocations.value, stroke.value)
      pushDraw(gl)
    }
  }

  bake() {
    var gl = this.gl

    // reset the texture and framebuffer
    this.clear()

    // enable blending
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // get the resources we need ready
    this.useFB()
    gluse(gl, brushProgram, model)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, brushTexture)
    gl.uniform1i(brushProgram.uniformLocations.texture, 0)

    this.strokes.forEach((stroke) => {

      const transform = mat4.create()
      mat4.translate(transform, transform, [stroke.x,stroke.y,0])
      mat4.scale(transform, transform, [stroke.radius,stroke.radius*(this.width/this.height),1])
      gl.uniformMatrix4fv(brushProgram.uniformLocations.transform, false, transform)
      gl.uniform1f(brushProgram.uniformLocations.value, stroke.value)
      pushDraw(gl)

    })
    this.stagingPtr = this.strokes.length
    this.needsBake = false
  }

}


function newMask(gl) {
  return new Mask(gl, sourceImageWidth, sourceImageHeight)
}
