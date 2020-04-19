var model
var copyprogram
var widgets = {}
var widgetOrder = ['adjustments',  'test', 'detailsv2']
var framebuffers = {}
var sourceImage
var lastrender
var imageB64
var imageFormat
var imagePath
var srcPackage

function prepare (gl) {
  model = prepareModelBuffer(gl)
  copyprogram = loadShaderPack(gl, __dirname + '/shaders/copy', {
    atrribVertexCoord: 'aVertex',
    atrribTextureCoord: 'aTextureCoord',
    uniforms: {
      'transform': 'transform',
      'texture': 'texSampler',
    }
  })
  loadWidgets(gl)
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, 640, 480)

  // ask for the image path
  var resp = ipcRenderer.sendSync('request-file-info')
  var fileName = resp.path.split('/')
  document.getElementById('filename-tag').textContent = fileName[fileName.length-1]
  console.log('image', resp)
  if (resp.type === 'image') {
    imagePath = resp.path
    imageB64 = fs.readFileSync(imagePath).toString('base64')
    imageFormat = imagePath.split('.')
    imageFormat = imageFormat[imageFormat.length-1]
    sourceImage = loadTexture(gl, imageFormat, imageB64)
  } else if (resp.type === 'project') {
    imagePath = null
    srcPackage = JSON.parse(fs.readFileSync(resp.path))
    imageB64 = srcPackage.image.data
    imageFormat = srcPackage.image.format
    sourceImage = loadTexture(gl, imageFormat, imageB64)
    loadPackage(srcPackage, widgetOrder, widgets, resp.path)
  }
  createWidgetUIs()

}

function triggerRecreateFrameBuffers (gl) {
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, sourceImageWidth * renderquality, sourceImageHeight * renderquality)
}

function update (gl, framebuffers, widgets, widgetOrder, sourceImage) {
  var lastchain = 0
  widgetOrder.forEach((widgetname, i) => {
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
    if (i === widgetOrder.length-1) {
      // if this is the last widget, use the result framebuffer
      destfb = framebuffers.final
    }
    runWidget(gl, widget, source, destfb, widgetFramebuffers)
  });
}

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

function updateCanvas (gl, x,y, scale, framebuffer) {
  requestAnimationFrame(function(){
    updateFromFramebuffers(gl, framebuffer, null, {
      translate: [x, y, 0],
      scale: [scale, -(pcaspect)/(framebuffers.final.width/framebuffers.final.height)*scale, 1],
    })
  })
}

function render (gl) {
  update(gl, framebuffers, widgets, widgetOrder, sourceImage)
}
