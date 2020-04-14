// loads a widget and its shaders from disk
function loadWidget (gl, path) {
  var widget
  try {
    widget = require(path)
  } catch(err) {
    throw new Error(`Unable to load widget from ${path}: ${err}`)
    return
  }
  widget.stages.forEach((shader) => {
    shader.glshaderpack = loadShaderPack(gl, `${__dirname}/shaders/${widget.baseShader}:${shader.shadername}`, shader)
    // error checking
    if (shader.glshaderpack.attribLocations.aVertex === -1) console.error(`could not get AttribLocation for atrribVertexCoord: ${shader.atrribVertexCoord}`)
    if (shader.glshaderpack.attribLocations.textureCoord === -1) console.error(`could not get AttribLocation for atrribTextureCoord: ${shader.atrribTextureCoord}`)
  })
  return widget
}

// sets up opengl to use a widget
function useWidgetShader(gl, widget, shaderidx, imgs, fb) {
  var shader = widget.stages[shaderidx]
  gluse(gl, shader.glshaderpack, model)
  Object.keys(shader.knob_bindings).forEach((key) => {
    var value = shader.knob_bindings[key]
    switch (value.type) {
      case 'float':
        gl.uniform1f(shader.glshaderpack.uniformLocations[value.bindname], value.process(widget.knobs[key].value))
        break;
      default:
        throw new Error (`unknown type ${value.type} in binding for knob ${key} in widget shader ${shaderidx}:${shader.shadername}`)
    }
  })
  if ('__imagesize__' in shader.uniforms) {
    gl.uniform2i(shader.glshaderpack.uniformLocations['__imagesize__'], sourceImageWidth, sourceImageHeight)
  }
  useTextures(gl, shader.glshaderpack, imgs)
  useFB(gl, fb)
}

// runs a widget given the source image and framebuffer
function runWidget(gl, widget, img_in, fb_out, privateframebuffers) {
  widget.stages.forEach((item, i) => {
    var shader = widget.stages[i]
    var imgs = []
    var fb
    shader.inputs.forEach((inp) => {
      if (inp === 'in') imgs.push(img_in)
      else if (inp === 'original') imgs.push(sourceImage)
      else if (inp in privateframebuffers) imgs.push(privateframebuffers[inp].texture)
    });

    if (shader.out === 'out') fb = fb_out
    else if (shader.out in privateframebuffers) fb = privateframebuffers[shader.out]

    useWidgetShader(gl, widget, i, imgs, fb)
    draw(gl)
  });
}

// creates all of the needed framebuffers give the widget order
function createFramebuffers (gl, widgets, widgetOrder, width, height) {
  var chainFrameBuffersCount = 2
  var extraFrameBuffersCount = 0
  widgetOrder.forEach((widgetname) => {
    if (!(widgetname in widgets)) throw new Error (`widget ${widgetname} does not exist`)
    if (widgets[widgetname].framebuffers.length > extraFrameBuffersCount) extraFrameBuffersCount = widgets[widgetname].framebuffers.length
  });
  var chainFrameBuffers = []
  for (var i = 0; i<chainFrameBuffersCount; i++) {
    chainFrameBuffers.push(allocTextureFB(gl, width, height))
  }
  var extraFrameBuffers = []
  for (var i = 0; i<extraFrameBuffersCount; i++) {
    extraFrameBuffers.push(allocTextureFB(gl, width, height))
  }
  return {
    chain: chainFrameBuffers,
    extra: extraFrameBuffers,
    final: allocTextureFB(gl, width, height, true),
  }
}

function recreateFrameBuffers (gl, old, widgets, widgetOrder, width, height) {
  if (old.chain) old.chain.forEach((fb) => { deleteFB(gl, fb) });
  if (old.extra) old.extra.forEach((fb) => { deleteFB(gl, fb) });
  if (old.final) deleteFB(gl, old.final);
  return createFramebuffers(gl, widgets, widgetOrder, width, height)
}
