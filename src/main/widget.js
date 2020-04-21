// widgets describe a set of glsl shaders, how they are connected,
// and the ui elements attached to them (widgetUi)
// this file provides functions for reading and loading shaders into the gpu

// loads a widget and its shaders from disk
function loadWidget (gl, path) {
  var widget
  try {
    widget = require(path)
  } catch(err) {
    console.error(err)
    throw new Error(`Unable to load widget from ${path}: ${err.toString()}`)
    return
  }
  widget.stages.forEach((shader) => {
    console.log('-- loading stage:', shader.shadername)
    shader.glshaderpack = loadShaderPack(gl, `${__dirname}/shaders/${shader.shadername}`, shader)
    // error checking
    if (shader.glshaderpack.attribLocations.aVertex === -1) console.error(`could not get AttribLocation for atrribVertexCoord: ${shader.atrribVertexCoord}`)
    if (shader.glshaderpack.attribLocations.textureCoord === -1) console.error(`could not get AttribLocation for atrribTextureCoord: ${shader.atrribTextureCoord}`)
  })

  return widget
}

// sets up opengl to use a widget
function useWidgetShader(gl, widget, shaderidx, imgs, fb) {
  var shader = widget.stages[shaderidx]
  // tell webgl to use a shader, and the rectangle model
  gluse(gl, shader.glshaderpack, model)
  // run a call back to load the uniform data for the shader
  Object.keys(shader.knob_bindings).forEach((key) => {
    if (!widget.knobs[key]) {
      throw new Error(`invalid knob binding: ${key}`)
    }
    shader.knob_bindings[key](widget.knobs[key].value, function(bind, type, setdata) {
      glSetUniformOrTextureData(gl, shader, bind, type, setdata)
    }, widget.knobs)
  })

  // special value for passing the image size to the texture
  if ('__imagesize__' in shader.uniforms) {
    gl.uniform2i(shader.glshaderpack.uniformLocations['__imagesize__'], sourceImageWidth, sourceImageHeight)
  }

  // if the shader uses custom data textures, add them to the active image set
  if (shader.textures) {
    shader.textures.forEach((texture) => {
      imgs.push(shader.glshaderpack.textures[texture])
    })
  }

  // tell webgl wich textures are used by the shader
  useTextures(gl, shader.glshaderpack, imgs)
  // set the output framebuffer
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

// delete the old framebuffers and make new ones
function recreateFrameBuffers (gl, old, widgets, widgetOrder, width, height) {
  if (old.chain) old.chain.forEach((fb) => { deleteFB(gl, fb) });
  if (old.extra) old.extra.forEach((fb) => { deleteFB(gl, fb) });
  if (old.final) deleteFB(gl, old.final);
  return createFramebuffers(gl, widgets, widgetOrder, width, height)
}

// loads widgets from list in widgets/load.js
function loadWidgets(gl) {
  widgetimports.forEach((widget) => {
    console.log('loading widget:', widget)
    widgets[widget] = loadWidget(gl, __dirname + `/widgets/${widget}.js`)
  });
}
