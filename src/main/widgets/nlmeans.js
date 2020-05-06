module.exports = {
  name: 'Denoise',
  tooltip: 'Use a variety of techniques to reduce image noise',
  knobs: {
    'Salt & Pepper': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
      tooltip: 'Reduce hot and cold pixels (Median Filter)',
    },
    'NL-Means': {
      type: 'slider',
      minValue: 0,
      maxValue: 3,
      value: 0,
      tooltip: 'Smooth images along edges. (NlMeans)'
    },
  },
  framebuffers: ['salt'],
  takesMask: false,
  stages: [
    {
      shadername: 'saltnpepper',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'amount': 'amount',
        'threshold': 'threshold',
      },
      knob_bindings: {
        'Salt & Pepper': function(v, set) {
          set('amount', 'float', (v/100))
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'salt',
    },

    {
      shadername: 'passthru',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 0) abort()
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'out',
    },

    {
      shadername: 'nlmeans3',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 1) abort()
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'out',
    },

    {
      shadername: 'nlmeans5',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 2) abort()
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'out',
    },

    {
      shadername: 'nlmeans7',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 3) abort()
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
