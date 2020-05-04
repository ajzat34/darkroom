var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'NLMeans',
  knobs: {
    'Amount': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
    },
    'Visualize Weights': {
      type: 'checkbox',
      value: false,
    },
    'select weight': {
      type: 'slider',
      minValue: 0,
      maxValue: 24,
      value: 0,
    },
    'gain': {
      type: 'slider',
      minValue: 0,
      maxValue: 10,
      value: 1,
      step: 0.1,
    },
    'Visualize Noise': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: [],
  takesMask: false,
  stages: [
    {
      shadername: 'nlmeans',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'amount': 'amount',
        'vnoise': 'vnoise',
        'vweights': 'vweights',
        'selweight': 'selweight',
        'gain': 'mag',
      },
      knob_bindings: {
        'Amount': function(v, set) {
          set('amount', 'float', (v/100))
        },
        'select weight': function(v, set) {
          set('selweight', 'int', v)
        },
        'gain': function(v, set) {
          set('gain', 'float', v)
        },
        'Visualize Noise': function(v, set) {
          set('vnoise', 'bool', v)
        },
        'Visualize Weights': function(v, set) {
          set('vweights', 'int', v)
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
