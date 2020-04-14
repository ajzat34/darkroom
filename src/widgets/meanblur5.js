module.exports = {
  name: 'Mean Blur 5',
  knobs: {
  },
  baseShader: 'meanblur5',
  framebuffers: [],
  stages: [
    {
      shadername: 'main',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size'
      },
      knob_bindings: {
        // knob name : bind name
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
