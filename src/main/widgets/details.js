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
  name: 'Details',
  knobs: {
    'Sharpen': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Radius': {
      type: 'slider',
      minValue: 0.1,
      maxValue: 10,
      value: 4,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Noise Mask': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 8,
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
    'Color Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 80,
      step: 0.1,
    },
    'Value Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 25,
      step: 0.1,
    },
    'Saturation Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
      step: 0.1,
    },
    'Visualize Image Analysis': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: ['stage1', 'blur'],
  stages: [
    {
      shadername: 'gaussian',
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
        'hsvweights': 'sum',
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
        'Color Noise': function(v, set, k){
          var h = k['Color Noise'].value/100
          var s = k['Value Noise'].value/100
          var v = k['Saturation Noise'].value/100
          var sum = h+s+v
          console.log(sum, [h/sum, s/sum, v/sum])
          set('hsvweights', 'vec3', [h/sum, s/sum, v/sum])
        }
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'stage1',
    },
    {
      shadername: 'gaussian',
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
      inputs: ['stage1'],
      inputBindings: ['texSampler'],
      out: 'blur',
    },
    {
      shadername: 'sharpness_masks',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'balance': 'balance',
        'slimit': 'slimit',
        'dlimit': 'dlimit',
        'showmask': 'showmask',
        'sharpen': 'sharpen',
        'denoise': 'denoise',
      },
      knob_bindings: {
        'Noise Mask': function(v, set) {
          set('balance', 'float', v/400)
        },
        'Sharpen': function(v, set) {
          set('sharpen', 'float', (v/10))
        },
        'Denoise': function(v, set) {
          set('denoise', 'float', (v/10))
        },
        'Visualize Image Analysis': function(v, set) {
          set('showmask', 'bool', v)
        },
      },
      inputs: ['in','blur'],
      inputBindings: ['imageSampler', 'blurSampler'],
      out: 'out',
    },
  ],
}
