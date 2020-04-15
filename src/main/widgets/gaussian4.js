module.exports = {
  name: 'Gaussian Blur 4x4',
  knobs: {
  },
  baseShader: 'gaussian4',
  framebuffers: ['horizontal'],
  stages: [
    {
      shadername: 'horizontal',
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
      out: 'horizontal',
    },
    {
      shadername: 'vertical',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size'
      },
      knob_bindings: {
        // knob name : bind name
      },
      inputs: ['horizontal'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
