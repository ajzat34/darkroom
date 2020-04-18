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
  17: 9,
  19: 10,
  21: 11,
}

module.exports = {
  name: 'Sharpness',
  knobs: {
    'Strength': {
      type: 'slider',
      minValue: 0,
      maxValue: 120,
      value: 0,
      step: 1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Radius': {
      type: 'slider',
      minValue: 0.1,
      maxValue: 10,
      value: 1,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Denoise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Sharpness Limit': {
      type: 'slider',
      minValue: 0,
      maxValue: 1,
      value: 0,
      step: 0.01,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Denoise Limit': {
      type: 'slider',
      minValue: 0,
      maxValue: 1,
      value: 0,
      step: 0.01,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Size': {
      type: 'slider',
      minValue: 3,
      maxValue: 15,
      value: 3,
      step: 2,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Search Area': {
      type: 'slider',
      minValue: 1,
      maxValue: 8,
      value: 2,
      step: 1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Visualize Image Analysis': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: ['vary', 'blur'],
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
        'alphakernel': 'alphakernel',
      },
      knob_bindings: {
        'Size': function(v, set, k) {
            var kernel = v
            var stdev = (k['Radius'].value/10)*kernelLut[kernel]
            set('mode', 'int', 0)
            set('kernel', 'int', kernel)
            set('alphaMode', 'int', 1)
            set('sizes', 'floatarray', gaussianNDist(kernelLut[kernel], stdev))
          },
        'Search Area': function(v, set, k) {
            set('alphakernel', 'int', v)
          },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'vary',
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
        'Size': function(v, set, k) {
          var kernel = v
          var stdev = (k['Radius'].value/10)*kernelLut[kernel]
          set('mode', 'int', 1)
          set('kernel', 'int', kernel)
          set('alphaMode', 'int', 2)
          set('sizes', 'floatarray', gaussianNDist(kernelLut[kernel], stdev))
        },
      },
      inputs: ['vary'],
      inputBindings: ['texSampler'],
      out: 'blur',
    },
    {
      shadername: 'sharpness:masks',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'balance': 'balance',
        'strength': 'strength',
        'slimit': 'slimit',
        'dlimit': 'dlimit',
        'showmask': 'showmask',
      },
      knob_bindings: {
        'Strength': function(v, set) {
          set('strength', 'float', v/10)
        },
        'Denoise': function(v, set) {
          set('balance', 'float', v/200)
        },
        'Sharpness Limit': function(v, set) {
          set('slimit', 'float', (v)-1)
        },
        'Denoise Limit': function(v, set) {
          set('dlimit', 'float', ((1-v)*2)-1)
        },
        'Visualize Image Analysis': function(v, set){
          set('showmask', 'bool', v)
        }
      },
      inputs: ['in','blur'],
      inputBindings: ['imageSampler', 'blurSampler'],
      out: 'out',
    },
  ],
}
