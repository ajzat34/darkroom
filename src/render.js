var model
var copyprogram
var widgets = {}
var widgetOrder = ['adjustments', 'adjustments']
var framebuffers = {}
var sourceImage

function prepare (gl) {
  model = prepareModelBuffer(gl)
  sourceImage = loadTexture(gl, 'image.jpg')
  copyprogram = loadShaderPack(gl, __dirname + '/shaders/copy', {
    atrribVertexCoord: 'aVertex',
    atrribTextureCoord: 'aTextureCoord',
    textureSampler: 'texSampler',
  })
  widgets.adjustments = loadWidget(gl, __dirname + '/widgets/adjustments.js')
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, 640, 480)
}

function triggerRecreateFrameBuffers (gl) {
  framebuffers = recreateFrameBuffers(gl, framebuffers, widgets, widgetOrder, sourceImageWidth, sourceImageHeight)
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

function updateFromFramebuffers (gl, framebuffers) {
  gluse(gl, copyprogram, model, framebuffers.final.texture)
  useFB(gl, null)
  draw (gl)
}

function updateCanvas (gl) {
  updateFromFramebuffers(gl, framebuffers)
}

function render (gl) {
  update(gl, framebuffers, widgets, widgetOrder, sourceImage)
  updateCanvas(gl)
}
