var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Salt & Pepper Denoise',
  knobs: {
    'Amount': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
    },
  },
  framebuffers: [],
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
        'Amount': function(v, set) {
          set('amount', 'float', (v/100))
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
