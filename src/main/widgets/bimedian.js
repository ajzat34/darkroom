var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Bimedian Denoise',
  knobs: {
    'Amount': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
    },
  },
  framebuffers: ['mid'],
  takesMask: false,
  stages: [
    {
      shadername: 'bimedian',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'amount': 'amount',
        'dir': 'd',
      },
      knob_bindings: {
        'Amount': function(v, set) {
          set('amount', 'float', (v/100))
          set('dir', 'ivec2', [0,1])
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'mid',
    },

    {
      shadername: 'bimedian',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'amount': 'amount',
        'dir': 'd',
      },
      knob_bindings: {
        'Amount': function(v, set) {
          set('amount', 'float', (v/100))
          set('dir', 'ivec2', [1,0])
        },
      },
      inputs: ['mid'],
      inputBindings: ['texSampler'],
      out: 'out',
    },

    // {
    //   shadername: 'saltnpepper',
    //   atrribVertexCoord: 'aVertex',
    //   atrribTextureCoord: 'aTextureCoord',
    //   uniforms: {
    //     // bind name : in-shader name
    //     '__imagesize__': 'size',
    //     'amount': 'amount',
    //     'dir': 'd',
    //   },
    //   knob_bindings: {
    //     'Amount': function(v, set) {
    //       set('amount', 'float', (v/100))
    //     },
    //   },
    //   inputs: ['mid'],
    //   inputBindings: ['texSampler'],
    //   out: 'out',
    // },
  ],
}
