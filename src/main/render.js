var bits16Mode = false

// defines the default opengl texture formats
var textureInternalFormat = 'RGBA'
var textureFormat = 'RGBA'
var textureType = 'UNSIGNED_BYTE'

var webGLtextureInternalFormat
var webGLtexutreFormat
var webGLtextureType

// does most of the webgl/widget setup
// - loads model
// - loads shaders
// - loads widgets
// - creates the widget-ui elements
// - creates the framebuffers
// - loads the image
// when done loading the image, loadTexture() will call eventImageLoad() to finish preparing and show the window
async function prepare (gl) {

  webGLtextureInternalFormat = gl[textureInternalFormat]
  webGLtextureFormat = gl[textureFormat]
  webGLtextureType = gl[textureType]

  // to render the image we use two texture-mapped triangles
  model = prepareModelBuffer(gl)

  // load the shader used for drawing the result to the viewport/canvas
  copyprogram = loadShaderPack(gl, __dirname + '/shaders/copy', {
    atrribVertexCoord: 'aVertex',
    atrribTextureCoord: 'aTextureCoord',
    uniforms: {
      'transform': 'transform',
      'texture': 'texSampler',
    }
  })

  // loads the widgets in /widgets/load.js
  loadWidgets(gl)

  // ask the main process for the image path
  var resp = ipcRenderer.sendSync('request-active-file')
  imagePath = resp.filepath
  await loadSource(gl, imagePath, eventImageLoad)
  // if 16 bits mode is enabled add the raw developer widget
  if (bits16Mode) {
    widgetOrder.unshift('rawdev')
    renderPasses[0].unshift('rawdev')
  }

  // prepare resources for masks
  maskInit(gl)

  // create the options widgets
  createWidgetUIs()
}

function triggerRecreateFrameBuffers (gl) {
  createMasks(gl, widgets, widgetOrder)
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, sourceImageWidth, sourceImageHeight)
}

// renders the result image to a framebuffer for later use
function update (gl, framebuffers, widgets, widgetOrder, sourceImage, destFramebuffer) {
  var frameWidgetOrder = []
  var stop = false
  // update masks and create the widget order for this render
  widgetOrder.forEach((widgetname, i) => {
    if (stop) return
    var widget = widgets[widgetname]
    if (!widget) throw new Error(`unknown widget ${widgetname}`)
    if (widget.mask) widget.mask.bakeIf()
    if (widgetState[widgetname]._enabled === true) frameWidgetOrder.push(widgetname)
    if (widgetState[widgetname]["Visualize Image Processing"] && widgetState[widgetname]["Visualize Image Processing"].value) stop = true
  })
  var lastchain = 0
  frameWidgetOrder.forEach((widgetname, i) => {
    var widget = widgets[widgetname]
    var widgetFramebuffers = {}

    // allocate extra framebuffers to this widget if needed
    widget.framebuffers.forEach((name, i) => { widgetFramebuffers[name] = framebuffers.extra[i] });

    // chose what framebuffers will be the input and output
    lastchain = (1-lastchain)
    var source = framebuffers.chain[lastchain].texture
    var destfb = framebuffers.chain[1-lastchain]
    if (i === 0) {
      // if this is the first widget, pull from the source image
      source = sourceImage
    }
    if (i === frameWidgetOrder.length-1) {
      // if this is the last widget, use the result framebuffer
      destfb = destFramebuffer
    }
    runWidget(gl, widget, source, destfb, widgetFramebuffers)
  });
  // if there are no active widgets use the copy shader to write directly to the result
  if (frameWidgetOrder.length === 0) {
    console.log('no widgets active in renderpass, using passthru shaders')
    updateFromFramebuffers(gl, sourceImage, destFramebuffer, {
      translate: [0, 0, 0],
      scale: [1, 1, 1],
    })
  }
}

// stateful wrapper for update()
function render (gl, startIndex) {
  console.log('rendering from pass', startIndex)
  for (var i =startIndex; i<renderPasses.length; i++) {
    var srcImg
    var destFb
    if (i===0) srcImg = sourceImage
    else srcImg = framebuffers.render[i-1].texture
    if (i===renderPasses.length-1) destFb = framebuffers.final
    else destFb = framebuffers.render[i]
    update(gl, framebuffers, widgets, renderPasses[i], srcImg, destFb)
  }
}

// renders a framebuffer's texture image to a WebGL2RenderingContext
// this is used to render the result to the viewport
function updateFromFramebuffers (gl, framebuffer, dst, tin) {
  // bind the program and framebuffer
  gluse(gl, copyprogram, model)
  useFB(gl, dst)
  // bind the final texture
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, framebuffer)
  gl.uniform1i(copyprogram.uniformLocations.texture, 0)
  // create the transform matrix
  const transform = mat4.create()
  mat4.scale(transform, transform, tin.scale)
  mat4.translate(transform, transform, tin.translate)
  gl.uniformMatrix4fv(copyprogram.uniformLocations.transform, false, transform)
  draw (gl)
}

// uses the above function to draw a framebuffers's texture to a WebGL2RenderingContext with proper a transform matrix
function updateCanvas (gl, x,y, scale, framebuffer) {

  var wr = pc.width/ framebuffers.final.width
  var hr = pc.height/ framebuffers.final.height
  var ratioscale = Math.min(hr/wr,1)

  requestAnimationFrame(function(){
    updateFromFramebuffers(gl, framebuffer, null, {
      translate: [x/ratioscale, y, 0],
      scale: [scale*ratioscale, -(pcaspect)/(framebuffers.final.width/framebuffers.final.height)*scale*ratioscale, 1],
    })
  })

}
