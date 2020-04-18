var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Gaussian Blur',
  knobs: {
    'Kernel': {
      type: 'slider',
      minValue: 3,
      maxValue: 19,
      value: 5,
      step: 2,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 120,
      value: 50,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
  },
  framebuffers: [''],
  stages: [
    {
      shadername: 'convolution',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'kernel': 'ksize',
        'weights': 'weights',
      },
      knob_bindings: {
        'Kernel': function(v, set, k) {
          var kernel = v
          var stdev = ((k['Radius'].value/100) * nFromKsize(kernel))
          set('kernel', 'int', kernel)
          set('weights', 'floatarray', gaussianNDist2D(kernel, stdev))
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
