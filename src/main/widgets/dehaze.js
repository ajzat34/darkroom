var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Dehaze',
  knobs: {
    'Amount': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Ambient': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Brightness': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Show Depth': {
      type: 'checkbox',
      value: false,
    },
  },
  takesMask: true,
  framebuffers: [],
  stages: [
    {
      shadername: 'hazedepth',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'vis': 'vis',
        'amount': 'amount',
        'ambient': 'ambient',
        'dark': 'dark',
      },
      knob_bindings: {
        'Show Depth': function(v,set) {
          set('vis', 'int', v)
        },
        'Amount': function(v, set) {
          set('amount', 'float', v/200)
        },
        'Ambient': function(v, set) {
          set('ambient', 'float', v/100)
        },
        'Brightness': function(v, set) {
          set('dark', 'float', v/100)
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
