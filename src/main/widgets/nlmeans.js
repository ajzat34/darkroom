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
      tooltip: 'Smooth images along edges. (luma)'
    },
    'Details': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
    'Chroma Details': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
    'Chrominance': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
    'Luminance': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
  },
  framebuffers: ['salt', 'luma', 'chroma'],
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
      out: 'luma',
    },

    {
      shadername: 'nlmeans3',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'power': 'power',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 1) abort()
        },
        "Details": function(v, set) {
          set('power', 'float', 50/(v))
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'luma',
    },

    {
      shadername: 'nlmeans5',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'power': 'power',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 2) abort()
        },
        "Details": function(v, set) {
          set('power', 'float', 50/(v))
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'luma',
    },

    {
      shadername: 'nlmeans7',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'power': 'power',
      },
      knob_bindings: {
        'NL-Means': function(v, set, k, abort) {
          if (v !== 3) abort()
        },
        "Details": function(v, set) {
          set('power', 'float', 50/(v))
        },
      },
      inputs: ['salt'],
      inputBindings: ['texSampler'],
      out: 'luma',
    },

    {
      shadername: 'nlmeans7',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'power': 'power',
      },
      knob_bindings: {
        "Chroma Details": function(v, set) {
          set('power', 'float', 50/(v))
        },
      },
      inputs: ['luma'],
      inputBindings: ['texSampler'],
      out: 'chroma',
    },

    {
      shadername: 'nlmeansmixer',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'lumaAmount': 'lumaAmount',
        'chromaAmount': 'chromaAmount',
      },
      knob_bindings: {
        "Luminance": function(v, set) {
          set('lumaAmount', 'float', v/100)
        },
        "Chrominance": function(v, set) {
          set('chromaAmount', 'float', v/100)
        },
      },
      inputs: ['salt', 'luma', 'chroma'],
      inputBindings: ['texSampler', 'lumaSampler', 'chromaSampler'],
      out: 'out',
    },
  ],
}
