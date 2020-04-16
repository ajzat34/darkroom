var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

var kernelLut = {
   3: 2,
   5: 3,
   7: 4,
   9: 5,
  11: 6,
  13: 7,
  15: 8,
}

module.exports = {
  name: 'Gaussian Blur',
  knobs: {
    'Kernel': {
      type: 'slider',
      minValue: 3,
      maxValue: 15,
      value: 5,
      step: 2,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Spread': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 50,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
  },
  framebuffers: ['mid'],
  stages: [
    {
      shadername: 'blur:gaussian',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'kernel': 'kernel',
        'sizes': 'sizes',
        'mode': 'mode',
        'alphaMode': 'alphaMode',
      },
      knob_bindings: {
        'Kernel': function(v, set, k) {
          var kernel = v
          var stdev = (k['Spread'].value/200)*kernelLut[kernel]
          set('mode', 'int', 0)
          set('kernel', 'int', kernel)
          set('alphaMode', 'int', 1)
          set('sizes', 'floatarray', gaussianNDist(kernelLut[kernel], stdev))
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'mid',
    },
    {
      shadername: 'blur:gaussian',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'kernel': 'kernel',
        'sizes': 'sizes',
        'mode': 'mode',
        'alphaMode': 'alphaMode',
      },
      knob_bindings: {
        'Kernel': function(v, set, k) {
          var kernel = v
          var stdev = (k['Spread'].value/200)*kernelLut[kernel]
          set('mode', 'int', 1)
          set('kernel', 'int', kernel)
          set('alphaMode', 'int', 2)
          set('sizes', 'floatarray', gaussianNDist(kernelLut[kernel], stdev))
        },
      },
      inputs: ['mid'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
