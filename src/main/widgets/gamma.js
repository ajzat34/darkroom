module.exports = {
  name: 'Gamma',
  knobs: {
    'Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 4,
      value: 1,
      step: '0.05',
    },
  },
  baseShader: 'gamma',
  framebuffers: [],
  stages: [
    {
      shadername: 'main',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        'gamma': 'gamma',
      },
      knob_bindings: {
        // knob name : bind name
        'Gamma': {bindname: 'gamma', type: 'float', process:
          function(v) { return v }
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
