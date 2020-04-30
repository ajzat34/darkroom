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
function prepare (gl) {

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
  console.log(resp)
  var fileName = resp.filepath.split('/')
  if (fileName.length === 1) {
    fileName = resp.filepath.split("\\")
  }
  document.getElementById('filename-tag').textContent = fileName[fileName.length-1]
  if (resp.loadmode === 'image') {
    // if we are loading an image, pass it to loadTexture directly as a base64 string
    imageB64 = fs.readFileSync(imagePath).toString('base64')
    imageFormat = imagePath.split('.')
    imageFormat = imageFormat[imageFormat.length-1].toLowerCase()
    // sourceImage = loadTexture(gl, webGLsourceImgInternalFormat, webGLsourceImgFormat, webGLsourceImgType, imageFormat, imageB64, eventImageLoad)
  } else if (resp.loadmode === 'project') {
    // if we are loading a project, extract the base64 image and mime type, then pass it to loadTexure
    srcPackage = JSON.parse(fs.readFileSync(imagePath))
    imageB64 = srcPackage.image.data
    imageFormat = srcPackage.image.format
    // sourceImage = loadTexture(gl, webGLsourceImgInternalFormat, webGLsourceImgFormat, webGLsourceImgType, imageFormat, imageB64, eventImageLoad)
  }
  loadImageByFormat(gl, imageFormat, imageB64, eventImageLoad)

  if (bits16Mode) widgetOrder.unshift('rawdev')

  // prepare resources for masks
  maskInit(gl)

  // create the options widgets
  createWidgetUIs()
}

// helper function for loading an image with the correct librarys
function loadImageByFormat(gl, format, base64image, callback) {
  if (format === 'tiff' || format === 'tif' || format === 'arw' || format === 'dng') {
    var tiff = TIFF.read(Buffer.from(base64image, 'base64'))
    console.log(tiff)
    // use the first readable image
    var tiffimage
    tiff.images.forEach((image, i) => {
      console.log('image', i, 'readable', tiff.images[i].readable)
      if (image.readable) tiffimage = image
    })
    if (!tiffimage) throw new Error('failed to find readable image from tiff file')
    var image = ImageToArrayBufferView(tiffimage)
    if (image.glImageInternalFormat === 'RGBA16F') bits16Mode = true
    sourceImage = loadTextureArray(gl, gl[image.glImageInternalFormat], gl[image.glImageFormat], gl[image.glImageType], image.width, image.height, image.data, callback, false)
  } else {
    sourceImage = loadTexture(gl, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, format, base64image, callback)
  }
}

function triggerRecreateFrameBuffers (gl) {
  createMasks(gl, widgets, widgetOrder)
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, sourceImageWidth, sourceImageHeight)
}

// renders the result image to a framebuffer for later use
function update (gl, framebuffers, widgets, widgetOrder, sourceImage) {
  var frameWidgetOrder = []
  // update masks and create the widget order for this render
  widgetOrder.forEach((widgetname, i) => {
    var widget = widgets[widgetname]
    if (widget.mask) widget.mask.bakeIf()
    if (widgetState[widgetname]._enabled === true) frameWidgetOrder.push(widgetname)
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
      destfb = framebuffers.final
    }
    runWidget(gl, widget, source, destfb, widgetFramebuffers)
  });
  // if there are no active widgets use the copy shader to write directly to the result
  if (frameWidgetOrder.length === 0) {
    updateFromFramebuffers(gl, sourceImage, framebuffers.final, {
      translate: [0, 0, 0],
      scale: [1, 1, 1],
    })
  }
}

// stateful wrapper for update()
function render (gl) {
  update(gl, framebuffers, widgets, widgetOrder, sourceImage)
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
  requestAnimationFrame(function(){
    updateFromFramebuffers(gl, framebuffer, null, {
      translate: [x, y, 0],
      scale: [scale, -(pcaspect)/(framebuffers.final.width/framebuffers.final.height)*scale, 1],
    })
  })
}
