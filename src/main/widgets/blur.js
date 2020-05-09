var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Gaussian Blur',
  knobs: {
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 24,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
  },
  takesMask: false,
  framebuffers: ['mid'],
  stages: [
    {
      shadername: 'gaussian_h',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'weights': 'weights',
      },
      knob_bindings: {
        'Radius': function(v, set) {
          var stdev = v/2
          set('weights', 'floatarray', gaussianNDist(24, stdev))
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'mid',
    },
    {
      shadername: 'gaussian_v',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'weights': 'weights',
      },
      knob_bindings: {
        'Radius': function(v, set) {
          var stdev = v/2
          set('weights', 'floatarray', gaussianNDist(24, stdev))
        },
      },
      inputs: ['mid'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
