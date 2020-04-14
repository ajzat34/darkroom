module.exports = {
  name: 'Mean Blur 2x 3x3',
  knobs: {
  },
  baseShader: 'meanblur9',
  framebuffers: ['tmp'],
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
      out: 'tmp',
    },
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
      inputs: ['tmp'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
