module.exports = {
  name: 'Denoise',
  tooltip: 'Use a variety of techniques to reduce image noise',
  knobs: {
    'Luminance': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
    },
    'Luminance Details': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
    'Chrominance': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
    },
    'Chroma Details': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
    },
    'Desaturate Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 20,
    },
    'Darken Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
    },
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 3,
      value: 1,
      tooltip: 'Smooth images along edges. (luma)'
    },
    'Salt & Pepper': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
      tooltip: 'Reduce hot and cold pixels (Median Filter)',
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
        'Radius': function(v, set, k, abort) {
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
        'Radius': function(v, set, k, abort) {
          if (v !== 1) abort()
        },
        "Luminance Details": function(v, set) {
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
        'Radius': function(v, set, k, abort) {
          if (v !== 2) abort()
        },
        "Luminance Details": function(v, set) {
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
        'Radius': function(v, set, k, abort) {
          if (v !== 3) abort()
        },
        "Luminance Details": function(v, set) {
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
        'desaturate': 'desaturate',
        'darken': 'darken',
      },
      knob_bindings: {
        "Luminance": function(v, set) {
          set('lumaAmount', 'float', v/100)
        },
        "Chrominance": function(v, set) {
          set('chromaAmount', 'float', v/100)
        },
        'Desaturate Noise': function(v, set) {
          set('desaturate', 'float', v/100)
        },
        'Darken Noise': function(v, set) {
          set('darken', 'float', v/100)
        }
      },
      inputs: ['salt', 'luma', 'chroma'],
      inputBindings: ['texSampler', 'lumaSampler', 'chromaSampler'],
      out: 'out',
    },
  ],
}
